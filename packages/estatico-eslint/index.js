/* eslint-disable global-require */
const { Plugin, Logger } = require('@unic/estatico-utils');
const Joi = require('joi');

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
    eslint: Joi.object().keys({
      fix: Joi.boolean(),
    }),
    changed: Joi.object().keys({
      firstPass: Joi.boolean(),
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
const defaults = (/* env */) => ({
  src: null,
  srcBase: null,
  dest: null,
  watch: null,
  plugins: {
    eslint: {
      fix: true,
    },
    changed: {
      firstPass: true,
    },
  },
  logger: new Logger('estatico-eslint'),
});

/**
 * Task function
 * @param {object} config - Complete task config
 * @param {object} env - Optional environment config, e.g. { dev: true }
 * @return {object} gulp stream
 */
const task = (config, env = {}) => {
  const gulp = require('gulp');
  const plumber = require('gulp-plumber');
  const changed = require('gulp-changed-in-place');
  const eslint = require('gulp-eslint');
  const through = require('through2');
  const chalk = require('chalk');
  const path = require('path');

  return gulp.src(config.src, {
    base: config.srcBase,
  })

    // Prevent stream from unpiping on error
    .pipe(plumber())

    // Do not pass unchanged files
    .pipe(config.plugins.changed ? changed(config.plugins.changed) : through.obj())

    // Stylelint verification
    .pipe(eslint(config.plugins.eslint).on('error', err => config.config.logger.error(err, env.dev)))
    .pipe(eslint.formatEach())
    .pipe(through.obj((file, enc, done) => {
      if (file.eslint && file.eslint.errorCount > 0) {
        const relFilePath = path.relative(config.srcBase, file.path);

        config.logger.error(new Error(`Linting error in file ${chalk.yellow(relFilePath)} (details above)`), env.dev);
      }

      return done(null, file);
    }))

    // Optionally write back to disc
    .pipe(config.plugins.eslint.fix ? gulp.dest(config.dest) : through.obj());
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
