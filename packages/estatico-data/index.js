const _ = require('lodash');
const glob = require('glob');
const path = require('path');
const callsite = require('callsite');
const fs = require('fs');
const Highlight = require('highlight.js');
const marked = require('marked');
const prettify = require('js-beautify');
const Handlebars = require('handlebars');

const fileCache = {};

function getFile(requirePath) {
  let cache = fileCache[requirePath];
  const { mtime } = fs.statSync(requirePath);
  let content;

  // Only read file if modified since last time
  if (!cache || (cache.mtime.getTime() !== mtime.getTime())) {
    content = fs.readFileSync(requirePath).toString();

    cache = {
      mtime,
      content,
    };

    fileCache[requirePath] = cache;
  }

  return cache.content;
}

// Resolve path relative to calling function (expecting a nesting of 2 by default)
function getRequirePath(relativeFilePath, nesting) {
  const stack = callsite();
  const requester = stack[nesting || 2].getFileName();

  return path.resolve(path.dirname(requester), relativeFilePath);
}

marked.setOptions({
  highlight(code) {
    return Highlight.highlightAuto(code).value;
  },
});

module.exports = {
  getDataGlob(fileGlob, dataTransform) {
    const data = {};
    const paths = glob.sync(fileGlob);

    _.each(paths, (filePath) => {
      const requirePath = path.resolve(filePath);
      const fileName = path.basename(filePath).replace('.data.js', '');
      let fileData = require(requirePath); // eslint-disable-line

      // Optional data transformation
      if (dataTransform) {
        fileData = dataTransform(fileData, filePath);
      }

      data[fileName] = fileData;
    });

    return data;
  },

  getFileContent(filePath) {
    const requirePath = getRequirePath(filePath);

    return getFile(requirePath);
  },

  getTestScriptPath(filePath) {
    const requirePath = getRequirePath(filePath);
    const scriptPath = path.join('/preview/assets/js/test/', path.basename(requirePath));

    return scriptPath;
  },

  getFormattedHtml(content) {
    const html = prettify.html(content, {
      indent_char: '\t',
      indent_size: 1,
    });

    return Highlight.highlight('html', html).value;
  },

  getFormattedHandlebars(content) {
    let usedPartials = this.getUsedPartialsInTemplate(content);
    let partialContent;

    // Look up content of all partials used in the main template
    usedPartials = usedPartials.map((partial) => {
      partialContent = getFile(path.resolve('./src/', `${partial}.hbs`));

      return {
        name: partial,
        content: this.getHighlightedTemplate(partialContent),
      };
    });

    return {
      content: this.getHighlightedTemplate(content),
      partials: usedPartials,
    };
  },

  getFormattedJsx(filePath) {
    const stack = callsite();
    const requester = stack[1].getFileName();
    const requirePath = path.resolve(path.dirname(requester), filePath);
    const extension = path.extname(filePath).substr(1);
    const content = getFile(requirePath);

    return Highlight.highlight(extension, content).value;
  },

  /**
   * Returns the given template code with a highlighted syntax as HTML.
   *
   * @param {string} content
   * @returns {string}
   */
  getHighlightedTemplate(content) {
    const highlighted = Highlight.highlight('html', content).value;

    // Link the used sub modules (excludes partials starting with underscore)
    return highlighted.replace(/({{&gt;[\s"]*)(([/]?[!a-z][a-z0-9-_]+)+)([\s"}]+)/g, '$1<a href="/$2.html">$2</a>$4');
  },

  /**
   * Returns a list with all partials within the defined template content.
   * Only includes the internal module partials (those starting with _),
   * which don't have an own module page.
   *
   * @param {string} content
   * @returns {Array}
   */
  getUsedPartialsInTemplate(content) {
    let list = [];
    const regexp = /{{>[\s"]*([a-z0-9/_-]+\/_[a-z0-9/._-]+)[\s"}]/g;
    let match;

    match = regexp.exec(content);
    while (match) {
      list.push(match[1]);
      match = regexp.exec(content);
    }

    // Remove duplicates
    list = [...new Set(list)];

    return list;
  },

  getFormattedJson(content) {
    const formatted = JSON.stringify(content, null, '\t');

    return Highlight.highlight('json', formatted).value;
  },

  getDataMock(filePath) {
    const requirePath = getRequirePath(filePath);
    let content = require(requirePath); // eslint-disable-line

    content = JSON.stringify(content, null, '\t');

    return Highlight.highlight('json', content).value;
  },

  getDocumentation(filePath) {
    const requirePath = getRequirePath(filePath);
    const content = getFile(requirePath);

    return marked(content);
  },

  getMarkedHandlebars(filePath, context) {
    const requirePath = getRequirePath(filePath);
    const content = getFile(requirePath);
    const compiledHandlebars = Handlebars.compile(content)(context);

    return marked(compiledHandlebars);
  },

  getColors(filePath) {
    const requirePath = getRequirePath(filePath);
    let colors = [];
    let content;

    try {
      content = fs.readFileSync(requirePath).toString();

      colors = _.map(JSON.parse(content), (value, key) => ({
        name: key,
        color: value,
      }));

      colors = _.map(colors, (color) => {
        // Remove non-aphanumeric characters
        color.name = color.name.replace(/\W/g, ''); // eslint-disable-line no-param-reassign

        return color;
      });
    } catch (err) {
      console.log(err);
    }

    return colors;
  },
};
