/* eslint-disable global-require */
const { Plugin, Logger } = require('@unic/estatico-utils');
const Joi = require('joi');
const path = require('path');

// Config schema used for validation
const schema = Joi.object().keys({
  src: [Joi.string().required(), Joi.array().required()],
  srcBase: Joi.string().required(),
  watch: Joi.object().keys({
    src: [Joi.string().required(), Joi.array().required()],
    name: Joi.string().required(),
  }).allow(null),
  plugins: {
    schema: Joi.object().keys({
      getPath: Joi.func(),
    }).allow(null),
    ajv: Joi.object().keys({
    }).allow(null),
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
  watch: null,
  plugins: {
    input: {
      // Which part of the input data to validate against the schema
      getData: data => data.props,
      // Where to find the schema
      getSchemaPath: filePath => filePath.replace(/\.data\.js$/, '.schema.json'),
    },
    ajv: {
      allErrors: true,
    },
    changed: {
      firstPass: true,
    },
  },
  logger: new Logger('estatico-json-schema'),
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
  const Ajv = require('ajv');
  const through = require('through2');
  const fs = require('fs');

  const ajv = new Ajv(config.plugins.ajv);

  return gulp.src(config.src, {
    base: config.srcBase,
    read: false,
  })

    // Prevent stream from unpiping on error
    .pipe(plumber())

    // Do not pass unchanged files
    .pipe(config.plugins.changed ? changed(config.plugins.changed) : through.obj())

    // Validate
    .pipe(through.obj((file, enc, done) => {
      const schemaPath = config.plugins.input.getSchemaPath(file.path);

      if (!fs.existsSync(schemaPath)) {
        config.logger.error({
          plugin: 'estatico-json-schema',
          message: `Schema not found in ${schemaPath}`,
        }, env.dev);

        return done();
      }

      const validationSchema = require(schemaPath); // eslint-disable-line import/no-dynamic-require
      const originalData = require(file.path); // eslint-disable-line import/no-dynamic-require
      const data = config.plugins.input.getData(originalData);

      const validation = ajv.compile(validationSchema);
      const isValid = validation(data);

      if (!isValid) {
        const fileName = path.relative(config.srcBase, file.path);

        validation.errors.forEach((error) => {
          config.logger.error({
            fileName,
            message: `${error.schemaPath}: ${error.message}`,
          }, env.dev);
        });

        return done();
      }

      return done();
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
