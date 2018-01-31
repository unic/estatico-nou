const gulp = require('gulp');
const plumber = require('gulp-plumber');
const prettify = require('gulp-prettify');
const Handlebars = require('handlebars');
const handlebarsWax = require('handlebars-wax');
const gulpHandlebars = require('gulp-hb');
const path = require('path');
const through = require('through2');
const log = require('fancy-log');
const PluginError = require('plugin-error');
const chalk = require('chalk');
const merge = require('lodash.merge');

const handlebars = Handlebars.create();

const defaults = {
  src: null,
  srcBase: null,
  dest: null,
  plugins: {
    handlebars: {
      handlebars,
      partials: null,
      // helpers: (hb) => {
      //   const layouts = require('handlebars-layouts'); // eslint-disable-line global-require

      //   hb.registerHelper(layouts(hb));

      //   return hb;
      // },
    },
    data: (file) => {
      // Find .data.js file with same name
      const dataFilePath = file.path.replace(path.extname(file.path), '.data.js');

      try {
        const data = require(dataFilePath); // eslint-disable-line

        return Object.assign({}, data);
      } catch (err) {
        log('estatico-handlebars (data)', chalk.cyan(path.relative('./src', dataFilePath)), chalk.red(err.message));

        return {};
      }
    },
    prettify: {
      indent_with_tabs: false,
      max_preserve_newlines: 1,
    },
  },
  errorHandler: (err) => {
    log(`estatico-handlebars${err.plugin ? ` (${err.plugin})` : null}`, chalk.cyan(err.fileName), chalk.red(err.message));
  },
};

function setupHandlebars(options) {
  console.log(1);
  const config = merge({
    helpers: require('handlebars-layouts'), // eslint-disable-line global-require
  }, options);
  const wax = handlebarsWax(handlebars);

  // Register partials
  if (config.partials) {
    wax.partials(config.partials);
  }

  // Register helpers
  if (config.helpers) {
    wax.helpers(config.helpers);
  }

  return handlebars;
}

module.exports = (options, watcher) => {
  console.log(2);
  let config = {};

  if (typeof options === 'function') {
    config = options(defaults);
  } else {
    config = merge({}, defaults, options);
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

      log(chalk.blue('estatico-handlebars'), `Rebuilding ${path.relative(config.srcBase, file.path)}`);

      return done(null, file);
    }))

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

    // Handlebars
    .pipe(gulpHandlebars(config.plugins.handlebars).on('error', config.errorHandler))

    // Formatting
    .pipe(config.plugins.prettify ? prettify(config.plugins.prettify) : through.obj())

    // Rename to .html
    .pipe(through.obj((file, enc, done) => {
      file.path = file.path.replace(path.extname(file.path), '.html'); // eslint-disable-line no-param-reassign

      done(null, file);
    }))

    // Save
    .pipe(gulp.dest(config.dest));
};

module.exports.handlebars = handlebars;
module.exports.setupHandlebars = setupHandlebars;
