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
  }).allow(null),
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
    clone: Joi.object().keys({
      data: Joi.object().allow(null),
      rename: Joi.func(),
    }).allow(null),
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
    clone: env.dev ? null : {
      data: {
        env: {
          dev: false,
        },
      },
      rename: (filePath) => {
        const path = require('path');

        return filePath.replace(path.extname(filePath), `.prod${path.extname(filePath)}`);
      },
    },
  },
  logger: new Logger('estatico-handlebars'),
});

/**
 * Task function
 * @param {object} config - Complete task config
 * @param {object} env - Environment config, e.g. { dev: true }
 * @param {object} [watcher] - Watch file events
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
  const merge = require('lodash.merge');
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

  return gulp.src(config.src, {
    base: config.srcBase,
  })

    // Prevent stream from unpiping on error
    .pipe(plumber())

    // Decide based on watcher dependency graph which files to pass through
    .pipe(through.obj((file, enc, done) => {
      if (watcher && watcher.resolvedGraph) {
        const resolvedGraph = watcher.resolvedGraph.map(getSimplifiedFilePath);
        const simplifiedFilePath = getSimplifiedFilePath(file.path);

        config.logger.debug('Resolved watch graph:', watcher.resolvedGraph);

        if (!resolvedGraph.includes(simplifiedFilePath)) {
          config.logger.debug(`${chalk.yellow(simplifiedFilePath)} not found in resolved graph. It will not be rebuilt.`);

          return done();
        }
      }

      return done(null, file);
    }))

    // Optional template transformation
    .pipe(through.obj((file, enc, done) => {
      if (config.plugins.transformBefore) {
        const content = config.plugins.transformBefore(file);

        file.contents = content; // eslint-disable-line no-param-reassign

        config.logger.debug(`Transformed ${chalk.yellow(file.path)} via "transformBefore"` /* , chalk.gray(content.toString()) */);
      }

      done(null, file);
    }).on('error', err => config.logger.error(err, env.dev)))

    // Find data and assign it to file object
    .pipe(through.obj((file, enc, done) => {
      try {
        const data = config.plugins.data(file, config.logger);

        file.data = data; // eslint-disable-line no-param-reassign

        config.logger.debug(`Data found for ${chalk.yellow(file.path)}`, chalk.gray(JSON.stringify(data, null, '\t')));

        done(null, file);
      } catch (err) {
        err.fileName = file.path;

        done(new PluginError('data', err), file);
      }
    }).on('error', err => config.logger.error(err, env.dev)))

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

        config.logger.debug(`Cloned ${chalk.yellow(file.path)} to ${chalk.yellow(clone.path)}`);

        this.push(clone);
      }

      done(null, file);
    }).on('error', err => config.logger.error(err, env.dev)))

    // Handlebars
    .pipe(gulpHandlebars(config.plugins.handlebars).on('error', err => config.logger.error(err, env.dev)))

    // Optional HTML transformation
    .pipe(through.obj((file, enc, done) => {
      if (config.plugins.transformAfter) {
        const content = config.plugins.transformAfter(file);

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
    }))

    // Log
    .pipe(through.obj((file, enc, done) => {
      config.logger.info(`Saving ${chalk.yellow(path.relative(config.srcBase, file.path))}`);

      return done(null, file);
    }))

    // Save
    .pipe(gulp.dest(config.dest));
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
