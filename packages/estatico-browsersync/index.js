/* eslint-disable global-require */
const { Plugin, Logger } = require('@unic/estatico-utils');
const Joi = require('joi');

// Config schema used for validation
const schema = Joi.object().keys({
  plugins: {
    browsersync: Joi.object().keys({
      server: Joi.string().required(),
      watch: [Joi.string().allow(null), Joi.array().allow(null)],
      port: Joi.number().required(),
      middleware: Joi.func().allow(null),
    }),
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
  plugins: {
    browsersync: {
      server: null,
      watch: null,
      port: 9000,
      middleware: (req, res, next) => {
        // Rewrite POST to GET
        if (req.method === 'POST') {
          req.method = 'GET';
        }

        // Respond with optional delay
        // Example: http://localhost:9000/mocks/demo/modules/slideshow/modules.json?delay=5000
        const delay = req.url.match(/delay=([0-9]+)/);

        if (delay) {
          setTimeout(() => {
            next();
          }, delay[1]);
        } else {
          next();
        }
      },
    },
  },
  logger: new Logger('estatico-browsersync'),
});

/**
 * Task function
 * @param {object} config - Complete task config
 * @param {object} env - Optional environment config, e.g. { dev: true }
 * @return {object} Browsersync instance
 */
const task = (config /* , env = {} */) => {
  const browsersync = require('browser-sync');

  const bs = browsersync.create();

  bs.init(config.plugins.browsersync);

  return bs;
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
