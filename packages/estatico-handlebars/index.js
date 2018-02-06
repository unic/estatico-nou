const Handlebars = require('handlebars');
const handlebarsWax = require('handlebars-wax');
const { Logger } = require('estatico-utils');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const merge = require('lodash.merge');

const logger = new Logger('estatico-handlebars');
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
      helpers: null,
    },
    transformBefore: null,
    transformAfter: null,
    data: (file) => {
      // Find .data.js file with same name
      const dataFilePath = file.path.replace(path.extname(file.path), '.data.js');

      if (!fs.existsSync(dataFilePath)) {
        logger.debug('data', `Data file ${chalk.yellow(dataFilePath)} not found for ${chalk.yellow(file.path)}. This will not break anything, but the template will receive no data.`);
      }

      const data = require(dataFilePath); // eslint-disable-line

      return merge({}, data);
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
  logger,
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
    const waxOptions = {};

    if (config.plugins.handlebars.parsePartialName) {
      waxOptions.parsePartialName = config.plugins.handlebars.parsePartialName;
    }

    wax.partials(config.plugins.handlebars.partials, waxOptions);
  }

  // Register helpers
  wax.helpers(require('handlebars-layouts')); // eslint-disable-line global-require

  if (config.plugins.handlebars && config.plugins.handlebars.helpers) {
    const waxOptions = {};

    if (config.plugins.handlebars.parseHelperName) {
      waxOptions.parsePartialName = config.plugins.handlebars.parseHelperName;
    }

    wax.helpers(config.plugins.handlebars.helpers, waxOptions);
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
        if (watcher && watcher.resolvedGraph) {
          config.logger.debug('watcher', 'Resolved watch graph:', watcher.resolvedGraph);

          if (!watcher.resolvedGraph.includes(file.path)) {
            config.logger.debug('watcher', `${chalk.yellow(file.path)} not found in resolved graph. It will not be rebuilt.`);

            return done();
          }
        }

        // config.logger.debug('watcher', `Passing ${chalk.yellow(file.path)} to next steps`);

        return done(null, file);
      }))

      // Optional template transformation
      .pipe(through.obj((file, enc, done) => {
        if (config.plugins.transformBefore) {
          const content = config.plugins.transformBefore(file);

          file.contents = content; // eslint-disable-line no-param-reassign

          config.logger.debug('transformBefore', `Transformed ${chalk.yellow(file.path)}`, chalk.gray(content.toString()), true);
        }

        done(null, file);
      }).on('error', err => config.logger.error(err, dev)))

      // Find data and assign it to file object
      .pipe(through.obj((file, enc, done) => {
        try {
          const data = config.plugins.data(file);

          file.data = data; // eslint-disable-line no-param-reassign

          config.logger.debug('data', `Data found for ${chalk.yellow(file.path)}`, chalk.gray(JSON.stringify(data, null, '\t')), true);

          done(null, file);
        } catch (err) {
          err.fileName = file.path;

          done(new PluginError('data', err), file);
        }
      }).on('error', err => config.logger.error(err, dev)))

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

          config.logger.debug('clone', `Cloned ${chalk.yellow(file.path)} to ${chalk.yellow(clone.path)}`);

          this.push(clone);
        }

        done(null, file);
      }).on('error', err => config.logger.error(err, dev)))

      // Handlebars
      .pipe(gulpHandlebars(config.plugins.handlebars).on('error', err => config.logger.error(err, dev)))

      // Optional HTML transformation
      .pipe(through.obj((file, enc, done) => {
        if (config.plugins.transformAfter) {
          const content = config.plugins.transformAfter(file);

          file.contents = content; // eslint-disable-line

          config.logger.debug('transformAfter', `Transformed ${chalk.yellow(file.path)}`);
        }

        done(null, file);
      }).on('error', err => config.logger.error(err, dev)))

      // Formatting
      .pipe(config.plugins.prettify ? prettify(config.plugins.prettify) : through.obj())

      // Rename to .html
      .pipe(through.obj((file, enc, done) => {
        const renamedPath = file.path.replace(path.extname(file.path), '.html');

        config.logger.debug('rename', `Renaming ${file.path} to ${chalk.yellow(renamedPath)}`);

        file.path = renamedPath; // eslint-disable-line no-param-reassign

        done(null, file);
      }))

      // Log
      .pipe(through.obj((file, enc, done) => {
        config.logger.info(`Saving ${chalk.yellow(path.relative(config.srcBase, file.path))}`);

        return done(null, file);
      }))

      // Save
      .pipe(gulp.dest(config.dest));
  };
};

module.exports.handlebars = handlebars;
