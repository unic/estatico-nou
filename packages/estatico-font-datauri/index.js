/* eslint-disable global-require, no-await-in-loop */
const { Plugin, Logger } = require('@unic/estatico-utils');
const Joi = require('joi');

// Config schema used for validation
const schema = Joi.object().keys({
  src: [Joi.string().required(), Joi.array().required()],
  watch: Joi.object().keys({
    src: [Joi.string().required(), Joi.array().required()],
    name: Joi.string().required(),
  }).allow(null),
  plugins: {
    simplefont: Joi.object().allow(null),
    concat: Joi.string(),
    rename: Joi.func().allow(null),
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
const defaults = (/* env */) => ({
  src: null,
  dest: null,
  plugins: {
    simplefont: null,
    concat: null,
    rename: null,
  },
  logger: new Logger('estatico-font-datauri'),
});

/**
 * Task function
 * @param {object} config - Complete task config
 * @param {object} env - Environment config, e.g. { dev: true }
 * @param {object} [watcher] - Watch file events (requires `@unic/estatico-watch`)
 * @return {object} gulp stream
 */
const task = (config, env = {}) => {
  const gulp = require('gulp');
  const plumber = require('gulp-plumber');
  const simplefont = require('gulp-simplefont64');
  const size = require('gulp-size');
  const through = require('through2');
  const concat = require('gulp-concat');

  return gulp.src(config.src)

    // Prevent stream from unpiping on error
    .pipe(plumber())

    // Rename
    .pipe(config.plugins.rename ? through.obj((file, enc, done) => {
      file.path = config.plugins.rename(file.path); // eslint-disable-line no-param-reassign

      done(null, file);
    }) : through.obj())

    // Simplefont64
    .pipe(simplefont(config.plugins.simplefont).on('error', err => config.logger.error(err, env.dev)))

    // Concatenate
    .pipe(config.plugins.concat ? concat(config.plugins.concat) : through.obj())

    // Log
    .pipe(size({
      showFiles: true,
      title: 'estatico-font-datauri',
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
