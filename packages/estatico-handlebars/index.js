const Handlebars = require('handlebars');
const handlebarsWax = require('handlebars-wax');
const log = require('fancy-log');
const path = require('path');
const chalk = require('chalk');
const merge = require('lodash.merge');

const handlebars = Handlebars.create();
const wax = handlebarsWax(handlebars);

const defaults = dev => ({
  src: null,
  srcBase: null,
  dest: null,
  plugins: {
    handlebars: {
      handlebars,
      partials: null,
      helpers: require('handlebars-layouts'), // eslint-disable-line global-require
    },
    transform: null,
    data: (file) => {
      // Find .data.js file with same name
      const dataFilePath = file.path.replace(path.extname(file.path), '.data.js');

      try {
        const data = require(dataFilePath); // eslint-disable-line

        return merge({}, data);
      } catch (err) {
        log('estatico-handlebars (data)', chalk.cyan(path.relative('./src', dataFilePath)), chalk.red(err.message));

        return {};
      }
    },
    prettify: {
      indent_with_tabs: false,
      max_preserve_newlines: 1,
    },
    clone: dev ? null : {
      data: {
        env: {
          dev: false,
        },
      },
      rename: filePath => filePath.replace(path.extname(filePath), `.prod${path.extname(filePath)}`),
    },
  },
  errorHandler: (err) => {
    log(`estatico-handlebars${err.plugin ? ` (${err.plugin})` : null}`, chalk.cyan(err.fileName), chalk.red(err.message));
  },
});

module.exports = (options, dev) => {
  let config = {};

  if (typeof options === 'function') {
    config = options(defaults(dev));
  } else {
    config = merge({}, defaults(dev), options);
  }

  // Validate options
  if (!config.src) {
    throw new Error('\'options.src\' is missing');
  }
  if (!config.srcBase) {
    throw new Error('\'options.srcBase\' is missing');
  }
  if (!config.dest) {
    throw new Error('\'options.dest\' is missing');
  }

  // Register partials
  if (config.plugins.handlebars && config.plugins.handlebars.partials) {
    wax.partials(config.plugins.handlebars.partials);
  }

  // Register helpers
  if (config.plugins.handlebars && config.plugins.handlebars.helpers) {
    wax.helpers(config.plugins.handlebars.helpers);
  }

  return (watcher) => {
    const gulp = require('gulp'); // eslint-disable-line global-require
    const plumber = require('gulp-plumber'); // eslint-disable-line global-require
    const prettify = require('gulp-prettify'); // eslint-disable-line global-require
    const gulpHandlebars = require('gulp-hb'); // eslint-disable-line global-require
    const through = require('through2'); // eslint-disable-line global-require
    const PluginError = require('plugin-error'); // eslint-disable-line global-require

    return gulp.src(config.src, {
      base: config.srcBase,
    })

      // Prevent stream from unpiping on error
      .pipe(plumber())

      // Decide based on watcher dependency graph which files to pass through
      .pipe(through.obj((file, enc, done) => {
        // TODO: Make sure HTML is rebuilt if corresponding data file changed
        if (watcher && watcher.resolvedGraph && !watcher.resolvedGraph.includes(file.path)) {
          return done();
        }

        // eslint-disable-next-line
        // log(chalk.blue('estatico-handlebars'), `Building ${path.relative(config.srcBase, file.path)}`);

        return done(null, file);
      }))

      // Optional template transformation
      .pipe(through.obj((file, enc, done) => {
        if (config.plugins.transform) {
          file.contents = config.plugins.transform(file); // eslint-disable-line no-param-reassign
        }

        done(null, file);
      }).on('error', config.errorHandler))

      // Find data and assign it to file object
      .pipe(through.obj((file, enc, done) => {
        try {
          file.data = config.plugins.data(file); // eslint-disable-line no-param-reassign

          done(null, file);
        } catch (err) {
          err.fileName = file.path;

          done(new PluginError('data', err), file);
        }
      }).on('error', config.errorHandler))

      // Optionally clone file
      .pipe(through.obj(function (file, enc, done) { // eslint-disable-line
        if (config.plugins.clone) {
          const clone = file.clone();

          // Extend default data
          clone.data = merge({}, file.data, config.plugins.clone.data);

          // Rename
          if (config.plugins.clone.rename) {
            clone.path = config.plugins.clone.rename(file.path);
          }

          this.push(clone);
        }

        done(null, file);
      }).on('error', config.errorHandler))

      // Handlebars
      .pipe(gulpHandlebars(config.plugins.handlebars).on('error', config.errorHandler))

      // Formatting
      .pipe(config.plugins.prettify ? prettify(config.plugins.prettify) : through.obj())

      // Rename to .html
      .pipe(through.obj((file, enc, done) => {
        file.path = file.path.replace(path.extname(file.path), '.html'); // eslint-disable-line no-param-reassign

        done(null, file);
      }))

      // Log
      .pipe(through.obj((file, enc, done) => {
        log(chalk.blue('estatico-handlebars'), `Saving ${path.relative(config.srcBase, file.path)}`);

        return done(null, file);
      }))

      // Save
      .pipe(gulp.dest(config.dest));
  };
};

module.exports.handlebars = handlebars;
