const path = require('path');
const fs = require('fs');

module.exports = {
  handlebars: (options) => {
    const config = Object.assign({
      srcBase: null, // Specify when using
      pattern: {
        hbs: /{{(?:>|#extend)[\s-]*["|']?([^"\s(]+).*?}}/g,
        js: /(?:require\('(.*?\.data\.js)'\)|getFileContent\('(.*?)'\))/g,
      },
    }, options);

    return {
      hbs: {
        match: config.pattern.hbs,
        resolve: (match /* , filePath */) => {
          if (!match[1]) {
            return null;
          }

          let resolvedPath = path.resolve(config.srcBase, match[1]);

          // Add extension
          resolvedPath = `${resolvedPath}.hbs`;

          return resolvedPath;
        },
      },
      js: {
        match: config.pattern.js,
        resolve: (match, filePath) => {
          if (!(match[1] || match[2])) {
            return null;
          }

          return path.resolve(path.dirname(filePath), match[1] || match[2]);
        },
      },
    };
  },
  schema: (options) => {
    const config = Object.assign({
      srcBase: null, // Specify when using
      pattern: /(?:require\('(.*?\.data\.js)'\)|require\('(.*?\.schema\.json))/g,
    }, options);

    return {
      js: {
        match: config.pattern,
        resolve: (match, filePath) => {
          if (!(match[1] || match[2])) {
            return null;
          }
          return path.resolve(path.dirname(filePath), match[1] || match[2]);
        },
      },
      json: {},
    };
  },
  sass: (options) => {
    const config = Object.assign({
      srcBase: null, // Specify when using
      pattern: /@import[\s-]*["|']?([^"\s(]+).*?/g,
    }, options);

    return {
      scss: {
        match: config.pattern,
        resolve: (match, filePath) => {
          if (!match[1]) {
            return null;
          }

          // Find possible path candidates
          const candidates = [
            path.dirname(filePath),
          ].concat(config.srcBase).map((dir) => {
            const partialPath = match[1].replace(path.basename(match[1]), `_${path.basename(match[1])}`);
            const candidatePath = path.resolve(dir, match[1]);
            const candidatePartialPath = path.resolve(dir, partialPath);
            const candidatePaths = [
              candidatePath,
              candidatePartialPath,
              // .scss extension
              path.extname(candidatePath) ? candidatePath : `${candidatePath}.scss`,
              path.extname(candidatePartialPath) ? candidatePartialPath : `${candidatePartialPath}.scss`,
              // .css extension
              path.extname(candidatePath) ? candidatePath : `${candidatePath}.css`,
            ];

            // Remove duplicates
            return [...new Set(candidatePaths)];
          }).reduce((arr, curr) => arr.concat(curr), []); // Flatten

          return candidates.find((candidatePath) => { // eslint-disable-line arrow-body-style
            // Ignore inexistent files
            return fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile();
          }) || null;
        },
      },
    };
  },
};
