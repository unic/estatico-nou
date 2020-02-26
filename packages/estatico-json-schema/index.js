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
    setup: Joi.object().keys({
      getData: Joi.func(),
      getSchemaPath: Joi.func(),
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
      getSchemaPath: (content /* , filePath */) => {
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
  const fs = require('fs');
  const $RefParser = require('json-schema-ref-parser');
  const importFresh = require('import-fresh');

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
    .pipe(through.obj(async (file, enc, done) => {
      const fileName = path.relative(config.srcBase, file.path);
      const content = importFresh(file.path);
      const validationSchemaPath = config.plugins.setup.getSchemaPath(content, file.path);

      if (!validationSchemaPath) {
        return done();
      }

      if (!fs.existsSync(validationSchemaPath)) {
        config.logger.error({
          fileName,
          message: `${validationSchemaPath} not found`,
        }, env.dev);

        return done();
      }

      const validationSchema = require(validationSchemaPath); // eslint-disable-line import/no-dynamic-require,max-len

      try {
        // Resolve local references
        const resolvedValidationSchema = await $RefParser.dereference(validationSchemaPath, validationSchema, {}); // eslint-disable-line max-len

        // Create validation function
        const validation = ajv.compile(resolvedValidationSchema);

        // Get data object (or array of data objects)
        let data = config.plugins.setup.getData(content);

        // Make sure we have an array anyway
        if (!Array.isArray(data)) {
          data = [data];
        }

        // Loop through variants and validate each
        data.forEach((variantData, i) => {
          const valid = validation(variantData);
          const variantName = i ? `Variant ${i}` : 'Default';
          const errorPrefix = data.length > 1 ? `[${variantName}] ` : '';

          if (!valid) {
            validation.errors.forEach((error) => {
              const details = error.params.additionalProperty ? ` (${JSON.stringify(error.params)})` : '';

              config.logger.error({
                fileName,
                message: `${errorPrefix}${error.schemaPath}: ${error.message}${details}`,
              }, env.dev);
            });
          }
        });
      } catch (err) {
        config.logger.error({
          fileName,
          message: err.message,
        }, env.dev);
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
