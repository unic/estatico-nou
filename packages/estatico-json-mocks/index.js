/* eslint-disable global-require, no-await-in-loop */
const { Plugin, Logger } = require('@unic/estatico-utils');
const Joi = require('joi');

// Config schema used for validation
const schema = Joi.object().keys({
  src: [Joi.string().required(), Joi.array().required()],
  srcBase: Joi.string().required(),
  dest: Joi.string().required(),
  plugins: {
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
    rename: filePath => filePath.replace('.mock.js', '.json'),
  },
  logger: new Logger('estatico-json-mocks'),
});

/**
 * Task function
 * @param {object} config - Complete task config
 * @param {object} env - Environment config, e.g. { dev: true }
 * @param {object} [watcher] - Watch file events (requires `@unic/estatico-watch`)
 * @return {object} gulp stream
 */
const task = (config /* , env = {} */) => {
  const gulp = require('gulp');
  const plumber = require('gulp-plumber');
  const through = require('through2');
  const chalk = require('chalk');

  return gulp.src(config.src, {
    base: config.srcBase,
    read: false,
  })

    // Prevent stream from unpiping on error
    .pipe(plumber())

    // Stringify to JSON
    .pipe(through.obj((file, enc, done) => {
      let data = require(file.path); // eslint-disable-line import/no-dynamic-require

      data = JSON.stringify(data, null, '  ');

      file.contents = Buffer.from(data); // eslint-disable-line no-param-reassign

      if (config.plugins.rename) {
        file.path = config.plugins.rename(file.path); // eslint-disable-line no-param-reassign
      }

      config.logger.info(`Saving data ${chalk.yellow(file.path)}`);

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
