'use strict';

var _ = require('lodash'),
  glob = require('glob'),
  path = require('path'),
  callsite = require('callsite'),
  fs = require('fs'),
  Highlight = require('highlight.js'),
  marked = require('marked'),
  prettify = require('js-beautify'),
  Handlebars = require('handlebars'),

  fileCache = {},

  getFile = function(requirePath) {
    var cache = fileCache[requirePath],
      mtime = fs.statSync(requirePath).mtime,
      content;

    // Only read file if modified since last time
    if (!cache || (cache.mtime.getTime() !== mtime.getTime())) {
      content = fs.readFileSync(requirePath).toString();

      cache = {
        mtime: mtime,
        content: content
      };

      fileCache[requirePath] = cache;
    }

    return cache.content;
  },

  // Resolve path relative to calling function (expecting a nesting of 2 by default)
  getRequirePath = function(relativeFilePath, nesting) {
    var stack = callsite(),
      requester = stack[nesting || 2].getFileName();

    return path.resolve(path.dirname(requester), relativeFilePath);
  };

marked.setOptions({
  highlight: function(code) {
    return Highlight.highlightAuto(code).value;
  }
});

module.exports = {
  getDataGlob: function(fileGlob, dataTransform) {
    var data = {},
      paths = glob.sync(fileGlob);

    _.each(paths, function(filePath) {
      var requirePath = path.resolve(filePath),
        fileName = path.basename(filePath).replace('.data.js', ''),
        fileData = require(requirePath);

      // Optional data transformation
      if (dataTransform) {
        fileData = dataTransform(fileData, filePath);
      }

      data[fileName] = fileData;
    });

    return data;
  },

  getFileContent: function(filePath) {
    var requirePath = getRequirePath(filePath);

    return getFile(requirePath);
  },

  getTestScriptPath: function(filePath) {
    var requirePath = getRequirePath(filePath),
      scriptPath = path.join('/test/', path.relative('./', requirePath));

    // Fix path on windows
    scriptPath = scriptPath.replace(new RegExp('\\' + path.sep, 'g'), '/');

    return scriptPath;
  },

  getFormattedHtml: function(content) {
    var html = prettify.html(content, {
        'indent_char': '\t',
        'indent_size': 1
      });

    return Highlight.highlight('html', html).value;
  },

  getFormattedHandlebars: function(content) {
    var usedPartials = this._getUsedPartialsInTemplate(content),
      partialContent;

    // Look up content of all partials used in the main template
    usedPartials = usedPartials.map((partial) => {
      partialContent = getFile(path.resolve('./src/', partial + '.hbs'));

      return {
        name: partial,
        content: this._getHighlightedTemplate(partialContent)
      };
    });

    return {
      content: this._getHighlightedTemplate(content),
      partials: usedPartials
    };
  },

  getFormattedJsx: function(filePath) {
    var stack = callsite(),
      requester = stack[1].getFileName(),
      requirePath = path.resolve(path.dirname(requester), filePath),
      extension = path.extname(filePath).substr(1),
      content = getFile(requirePath);

    return Highlight.highlight(extension, content).value;
  },

  /**
   * Returns the given template code with a highlighted syntax as HTML.
   *
   * @param {string} content
   * @returns {string}
   *
   * @private
   */
  _getHighlightedTemplate: function(content) {
    var highlighted = Highlight.highlight('html', content).value;

    // Link the used sub modules (excludes partials starting with underscore)
    return highlighted.replace(/({{&gt;[\s"]*)(([\/]?[!a-z][a-z0-9-_]+)+)([\s"}]+)/g, '$1<a href="/$2.html">$2</a>$4');
  },

  /**
   * Returns a list with all partials within the defined template content.
   * Only includes the internal module partials (those starting with _),
   * which don't have an own module page.
   *
   * @param {string} content
   * @returns {Array}
   *
   * @private
   */
  _getUsedPartialsInTemplate: function(content) {
    var list = [],
      regexp = /{{>[\s"]*([a-z0-9\/_-]+\/_[a-z0-9\/._-]+)[\s"}]/g,
      match;

    match = regexp.exec(content);
    while (match) {
      list.push(match[1]);
      match = regexp.exec(content);
    }

    // Remove duplicates
    list = [...new Set(list)];

    return list;
  },

  getFormattedJson: function(content) {
    var formatted = JSON.stringify(content, null, '\t');

    return Highlight.highlight('json', formatted).value;
  },

  getDataMock: function(filePath) {
    var requirePath = getRequirePath(filePath),
      content = require(requirePath);

    content = JSON.stringify(content, null, '\t');

    return Highlight.highlight('json', content).value;
  },

  getDocumentation: function(filePath) {
    var requirePath = getRequirePath(filePath),
      content = getFile(requirePath);

    return marked(content);
  },

  getMarkedHandlebars: function(filePath, context) {
    var requirePath = getRequirePath(filePath),
      content = getFile(requirePath),
      compiledHandlebars = Handlebars.compile(content)(context);

    return marked(compiledHandlebars);
  },

  getColors: function(filePath) {
    var requirePath = getRequirePath(filePath),
      colors = [],
      content;

    try {
      content = fs.readFileSync(requirePath).toString();

      colors = _.map(JSON.parse(content), function(value, key) {
        return {
          name: key,
          color: value
        };
      });

      colors = _.map(colors, function(color) {
        // Remove non-aphanumeric characters
        color.name = color.name.replace(/\W/g, '');

        return color;
      });
    } catch (err) {
      console.log(err);
    }

    return colors;
  },
};
