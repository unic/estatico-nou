/* eslint-disable global-require, no-await-in-loop */
const { Plugin, Logger } = require('@unic/estatico-utils');
const Joi = require('joi');

// We export webpack to allow for complete flexibility in config overwrite
const webpack = require('webpack');

// Config schema used for validation
const schema = Joi.object().keys({
  webpack: [Joi.object(), Joi.array()],
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
const defaults = () => {
  const webpackConfig = require('./webpack.config.js');

  return {
    webpack: webpackConfig,
    logger: new Logger('estatico-webpack'),
  };
};

/**
 * Task function
 * @param {object} config - Complete task config
 * @param {object} env - Environment config, e.g. { dev: true }
 * @param {object} [watcher] - Watch file events (requires `@unic/estatico-watch`)
 * @return {object} gulp stream
 */
const task = (config, env = {}, cb) => {
  const once = require('lodash.once');
  const chalk = require('chalk');
  const util = require('util');
  const { format } = require('./lib/stats');

  config.logger.debug('Webpack config', chalk.gray(util.inspect(config.webpack, {
    depth: 3,
  })));

  try {
    const compiler = webpack(config.webpack);

    const callback = (err, stats) => {
      let done = cb;

      if (env.watch) {
        done = once(done);
      }

      if (err) {
        config.logger.error(err);
      }

      config.logger.info(format(stats));

      done();
    };

    if (env.watch) {
      compiler.watch({}, callback);
    } else {
      compiler.run(callback);
    }

    return compiler;
  } catch (err) {
    config.logger.error(err, env.dev);

    return cb();
  }
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

/**
 * Export webpack
 */
module.exports.webpack = webpack;
