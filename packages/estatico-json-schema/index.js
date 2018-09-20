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
    dependencyGraph: Joi.object().keys({
      srcBase: Joi.string().required(),
      resolver: Joi.object().required(),
    }),
    name: Joi.string().required(),
  }).allow(null),
  plugins: {
    schema: Joi.object().keys({
      getPath: Joi.func(),
    }).allow(null),
    ajv: Joi.object().keys({
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
    setup: {
      // Which part of the input data to validate against the schema
      // Both default data and variants will be validated
      getData: (content /* , filePath */) => {
        const defaultData = content.props;
        const variants = content.variants ? Object.values(content.variants).map(v => v.props) : [];

        return [defaultData].concat(variants);
      },
      // Where to find the schema
      // eslint-disable-next-line arrow-body-style
      getSchema: (content /* , filePath */) => {
        return content.meta ? content.meta.schema : null;
      },
    },
    ajv: {
      allErrors: true,
    },
  },
  logger: new Logger('estatico-json-schema'),
});

/**
 * Task function
 * @param {object} config - Complete task config
 * @param {object} env - Optional environment config, e.g. { dev: true }
 * @param {object} [watcher] - Watch file events (requires `@unic/estatico-watch`)
 * @return {object} gulp stream
 */
const task = (config, env = {}, watcher) => {
  const gulp = require('gulp');
  const plumber = require('gulp-plumber');
  const Ajv = require('ajv');
  const through = require('through2');

  const ajv = new Ajv(config.plugins.ajv);

  return gulp.src(config.src, {
    base: config.srcBase,
    read: false,
  })

    // Prevent stream from unpiping on error
    .pipe(plumber())

    // Decide based on watcher dependency graph which files to pass through
    .pipe(through.obj((file, enc, done) => {
      if (watcher && watcher.matchGraph && !watcher.matchGraph(file.path, true)) {
        return done();
      }

      return done(null, file);
    }))

    // Validate
    .pipe(through.obj((file, enc, done) => {
      const content = require(file.path); // eslint-disable-line import/no-dynamic-require
      const validationSchema = config.plugins.setup.getSchema(content, file.path);

      if (!validationSchema) {
        return done();
      }

      // Get data object (or array of data objects)
      let data = config.plugins.setup.getData(content);

      // Make sure we have an array anyway
      if (!Array.isArray(data)) {
        data = [data];
      }

      // Loop through variants and validate each
      data.forEach((variantData, i) => {
        const validation = ajv.compile(validationSchema);
        const valid = validation(variantData);
        const variantName = i ? `Variant ${i}` : 'Default';
        const errorPrefix = data.length > 1 ? `[${variantName}] ` : '';

        if (!valid) {
          const fileName = path.relative(config.srcBase, file.path);

          validation.errors.forEach((error) => {
            config.logger.error({
              fileName,
              message: `${errorPrefix}${error.schemaPath}: ${error.message}`,
            }, env.dev);
          });
        }
      });

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
