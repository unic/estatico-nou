/* eslint-disable global-require, no-await-in-loop */
const { Plugin, Logger } = require('@unic/estatico-utils');
const Joi = require('joi');

// Config schema used for validation
const schema = Joi.object().keys({
  src: [Joi.string().required(), Joi.array().required()],
  srcBase: Joi.string().required(),
  dest: Joi.string(),
  watch: Joi.object().keys({
    src: [Joi.string().required(), Joi.array().required()],
    name: Joi.string().required(),
  }).allow(null),
  plugins: {
    stylelint: Joi.object().allow(null),
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
    stylelint: {
      fix: env.fix,
      failAfterError: true,
      reporters: [
        {
          formatter: 'string',
          console: true,
        },
      ],
    },
  },
  logger: new Logger('estatico-stylelint'),
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
  const changed = require('gulp-changed-in-place');
  const gulpStylelint = require('gulp-stylelint');
  const through = require('through2');

  return gulp.src(config.src, {
    base: config.srcBase,
  })

    // Prevent stream from unpiping on error
    .pipe(plumber())

    // Do not pass unchanged files
    .pipe(changed({
      firstPass: true,
    }))

    // Stylelint verification
    .pipe(gulpStylelint(config.plugins.stylelint).on('error', err => config.logger.error(err, env.dev)))

    // Write back to disc to allow for autofixing
    .pipe(config.plugins.stylelint.fix ? gulp.dest(config.srcBase) : through.obj());
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
