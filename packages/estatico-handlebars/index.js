/* eslint-disable global-require */
const { Plugin, Logger } = require('@unic/estatico-utils');
const Joi = require('joi');

// We need an exportable handlebars instance to be reused in other tasks
const handlebars = require('handlebars').create();

// Config schema used for validation
const schema = Joi.object().keys({
  src: [Joi.string().required(), Joi.array().required()],
  srcBase: Joi.string().required(),
  dest: Joi.string().required(),
  watch: Joi.object().keys({
    src: [Joi.string().required(), Joi.array().required()],
    name: Joi.string().required(),
    dependencyGraph: Joi.object().keys({
      srcBase: Joi.string().required(),
      resolver: Joi.object().required(),
    }),
    watcher: Joi.func(),
  }).with('dependencyGraph', 'watcher').allow(null),
  plugins: {
    handlebars: Joi.object().keys({
      handlebars: Joi.object().allow(null),
      partials: Joi.any().allow(null),
      helpers: Joi.any().allow(null),
    }),
    transformBefore: Joi.func().allow(null),
    transformAfter: Joi.func().allow(null),
    data: Joi.func().allow(null),
    prettify: Joi.object().allow(null),
    clone: Joi.func().allow(null),
    sort: Joi.func().allow(null),
  },
  logger: Joi.object().keys({
    info: Joi.func(),
    error: Joi.func(),
    debug: Joi.func(),
  }),
});

/**
 * Default config
 * @param {object} env - Optional environment config, e.g. { dev: true }
 * @return {object}
 */
const defaults = env => ({
  src: null,
  srcBase: null,
  dest: null,
  watch: null,
  plugins: {
    handlebars: {
      handlebars: null,
      partials: null,
      helpers: null,
    },
    transformBefore: null,
    transformAfter: null,
    data: (file, logger) => {
      const path = require('path');
      const fs = require('fs');
      const chalk = require('chalk');
      const merge = require('lodash.merge');

      // Find .data.js file with same name
      const dataFilePath = file.path.replace(path.extname(file.path), '.data.js');

      if (!fs.existsSync(dataFilePath)) {
        logger.debug(`Data file ${chalk.yellow(dataFilePath)} not found for ${chalk.yellow(file.path)}. This will not break anything, but the template will receive no data.`);
      }

      const data = require(dataFilePath); // eslint-disable-line

      return merge({}, data);
    },
    prettify: {
      indent_with_tabs: false,
      max_preserve_newlines: 1,
    },
    clone: env.ci ? (file) => {
      const path = require('path');
      const merge = require('lodash.merge');

      const clone = file.clone();

      // Extend default data
      clone.data = merge({}, file.data, {
        env: {
          dev: true,
        },
      });

      // Rename
      clone.path = file.path.replace(path.extname(file.path), `.dev${path.extname(file.path)}`);

      // Return array
      return [clone];
    } : null,
    sort: null,
  },
  logger: new Logger('estatico-handlebars'),
});

/**
 * Task function
 * @param {object} config - Complete task config
 * @param {object} env - Environment config, e.g. { dev: true }
 * @param {object} [watcher] - Watch file events (requires `@unic/estatico-watch`)
 * @return {object} gulp stream
 */
const task = (config, env = {}, watcher) => {
  const gulp = require('gulp');
  const plumber = require('gulp-plumber');
  const prettify = require('gulp-prettify');
  const gulpHandlebars = require('gulp-hb');
  const through = require('through2');
  const PluginError = require('plugin-error');
  const chalk = require('chalk');
  const path = require('path');
  const handlebarsWax = require('handlebars-wax');

  // Remove file extension from path, including complex ones like .data.js
  const getSimplifiedFilePath = (filePath) => {
    const fileName = path.basename(filePath).split('.')[0];

    return filePath.replace(path.basename(filePath), fileName);
  };

  const wax = handlebarsWax(handlebars);

  config.plugins.handlebars.handlebars = handlebars; // eslint-disable-line no-param-reassign

  // Register partials
  if (config.plugins.handlebars.partials) {
    const waxOptions = {};

    if (config.plugins.handlebars.parsePartialName) {
      waxOptions.parsePartialName = config.plugins.handlebars.parsePartialName;
    }

    wax.partials(config.plugins.handlebars.partials, waxOptions);
  }

  // Register helpers
  wax.helpers(require('handlebars-layouts'));

  if (config.plugins.handlebars.helpers) {
    const waxOptions = {};

    if (config.plugins.handlebars.parseHelperName) {
      waxOptions.parseHelperName = config.plugins.handlebars.parseHelperName;
    }

    wax.helpers(config.plugins.handlebars.helpers, waxOptions);
  }

  // Streaming helpers
  const stream = {
    files: [],
    index: -1,
    continue: false,
  };

  // Start streaming
  return gulp.src(config.src, {
    base: config.srcBase,
  })

    // Prevent stream from unpiping on error
    .pipe(plumber())

    // Decide based on watcher dependency graph which files to pass through
    .pipe(through.obj((file, enc, done) => {
      if (watcher && watcher.matchGraph && !watcher.matchGraph(file.path, true)) {
        return done();
      }

      return done(null, file);
    }).on('error', err => config.logger.error(err, env.dev)))

    // Optional sorting of passed files
    .pipe(through.obj((file, enc, done) => {
      if (config.plugins.sort) {
        // Don't immediately push files back to stream, create sortable array first
        stream.files.push(file);

        return done();
      }

      return done(null, file);
    }, function flush(done) {
      // Sort array and push files back to stream
      stream.files.sort(config.plugins.sort).forEach(file => this.push(file));

      return done();
    }).on('error', err => config.logger.error(err, env.dev)))

    // Wait for first file to successfully build
    // Otherwise, following files will slow down the build
    .pipe(through.obj((file, enc, done) => {
      // Skip if we are not in watch mode or if there is no sorting going on
      if (!(watcher && config.plugins.sort)) {
        return done(null, file);
      }

      stream.index += 1;

      // First file is passed through
      if (stream.index === 0) {
        return done(null, file);
      }

      // Following files have to wait
      const interval = setInterval(() => {
        if (stream.continue) {
          done(null, file);

          clearInterval(interval);
        }
      }, 100);

      return interval;
    }).on('error', err => config.logger.error(err, env.dev)))

    // Find data and assign it to file object
    .pipe(through.obj((file, enc, done) => {
      try {
        const data = config.plugins.data(file, config);

        file.data = data; // eslint-disable-line no-param-reassign

        config.logger.debug(`Data found for ${chalk.yellow(file.path)}`, chalk.gray(JSON.stringify(data, null, '\t')));

        done(null, file);
      } catch (err) {
        err.fileName = file.path;

        done(new PluginError('data', err), file);
      }
    }).on('error', err => config.logger.error(err, env.dev)))

    // Optional template transformation
    .pipe(through.obj((file, enc, done) => {
      if (config.plugins.transformBefore) {
        const content = config.plugins.transformBefore(file, config);

        file.contents = content; // eslint-disable-line no-param-reassign

        config.logger.debug(`Transformed ${chalk.yellow(file.path)} via "transformBefore"` /* , chalk.gray(content.toString()) */);
      }

      done(null, file);
    }).on('error', err => config.logger.error(err, env.dev)))

    // Optionally clone file
    .pipe(through.obj(function (file, enc, done) { // eslint-disable-line
      if (config.plugins.clone) {
        config.plugins.clone(file, config).forEach((clone) => {
          config.logger.debug(`Cloned ${chalk.yellow(file.path)} to ${chalk.yellow(clone.path)}`);

          this.push(clone);
        });
      }

      done(null, file);
    }).on('error', err => config.logger.error(err, env.dev)))

    // Handlebars
    .pipe(gulpHandlebars(config.plugins.handlebars).on('error', err => config.logger.error(err, env.dev)))

    // Optional HTML transformation
    .pipe(through.obj((file, enc, done) => {
      if (config.plugins.transformAfter) {
        const content = config.plugins.transformAfter(file, config);

        file.contents = content; // eslint-disable-line

        config.logger.debug(`Transformed ${chalk.yellow(file.path)} via "transformAfter"`);
      }

      done(null, file);
    }).on('error', err => config.logger.error(err, env.dev)))

    // Formatting
    .pipe(config.plugins.prettify ? prettify(config.plugins.prettify) : through.obj())

    // Rename to .html
    .pipe(through.obj((file, enc, done) => {
      const renamedPath = file.path.replace(path.extname(file.path), '.html');

      file.path = renamedPath; // eslint-disable-line no-param-reassign

      config.logger.debug(`Renamed ${chalk.yellow(file.path)} to ${chalk.yellow(renamedPath)}`);

      done(null, file);
    }).on('error', err => config.logger.error(err, env.dev)))

    // Log
    .pipe(through.obj((file, enc, done) => {
      config.logger.info(`Saving ${chalk.yellow(path.relative(config.srcBase, file.path))}`);

      return done(null, file);
    }))

    // Save
    .pipe(gulp.dest(config.dest))

    // Report that first file was successfully built
    .pipe(through.obj((file, enc, done) => {
      if (!stream.continue) {
        stream.continue = true;
      }

      return done(null, file);
    }));
};

/**
 * @param {object|func} options - Custom config
 *  Either deep-merged (object) or called (func) with defaults
 * @param {object} env - Optional environment config, e.g. { dev: true }, passed to defaults
 * @return {func} Task function from above with bound config and env
 */
module.exports = (options, env = {}) => new Plugin({
  defaults,
  schema,
  options,
  task,
  env,
});

/**
 * Handlebars instance
 */
module.exports.handlebars = handlebars;
