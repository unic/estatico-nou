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
const defaults = env => ({
  src: null,
  srcBase: null,
  dest: null,
  watch: null,
  plugins: {
    eslint: {
      fix: env.fix,
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
  const through = require('through2');
  const { ESLint } = require('eslint');

  return gulp.src(config.src, {
    base: config.srcBase,
  })

    // Prevent stream from unpiping on error
    .pipe(plumber())

    // Do not pass unchanged files
    .pipe(config.plugins.changed ? changed(config.plugins.changed) : through.obj())

    // pass files directly to eslint
    .pipe(through.obj(async (file, _enc, done) => {
      const eslint = new ESLint(config.plugins.eslint);
      const results = await eslint.lintFiles(file.path);
      const formatter = await eslint.loadFormatter('stylish');
      const output = formatter.format(results);

      if (config.plugins.eslint.fix) {
        await ESLint.outputFixes(results);
      }

      if (output.length > 0) {
        // eslint-disable-next-line no-console
        console.log(output);
      }

      return done(null, file);
    }).on('error', error => config.logger.error(error, env.dev)))
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
