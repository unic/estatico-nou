/* eslint-disable global-require, no-await-in-loop */
const { Plugin, Logger } = require('@unic/estatico-utils');
const Joi = require('joi');

// Config schema used for validation
const schema = Joi.object().keys({
  src: [Joi.string().required(), Joi.array().required()],
  srcBase: Joi.string().required(),
  dest: Joi.string().required(),
  plugins: {
    changed: Joi.object().allow(null),
    rename: Joi.func().allow(null),
  },
  watch: Joi.object().keys({
    src: [Joi.string().required(), Joi.array().required()],
    name: Joi.string().required(),
  }).allow(null),
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
const defaults = (/* env */) => ({
  src: null,
  srcBase: null,
  dest: null,
  plugins: {
    changed: {
      firstPass: true,
    },
    rename: null,
  },
  logger: new Logger('estatico-copy'),
});

/**
 * Task function
 * @param {object} config - Complete task config
 * @param {object} env - Environment config, e.g. { dev: true }
 * @param {object} [watcher] - Watch file events
 * @return {object} gulp stream
 */
const task = (config /* , env = {} */) => {
  const gulp = require('gulp');
  const plumber = require('gulp-plumber');
  const changed = require('gulp-changed-in-place');
  const through = require('through2');
  const chalk = require('chalk');

  return gulp.src(config.src, {
    base: config.srcBase,
  })

    // Prevent stream from unpiping on error
    .pipe(plumber())

    // Do not pass unchanged files
    .pipe(config.plugins.changed ? changed(config.plugins.changed) : through.obj())

    // Optionally rename
    .pipe(config.plugins.rename ? through.obj((file, enc, done) => {
      const filePath = config.plugins.rename(file.path);

      if (filePath !== file.path) {
        config.logger.debug(`Renamed ${chalk.yellow(file.path)} to ${chalk.yellow(filePath)}`);

        file.path = filePath; // eslint-disable-line no-param-reassign
      }

      return done(null, file);
    }) : through.obj())

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
