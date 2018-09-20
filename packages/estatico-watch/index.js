/* eslint-disable global-require, no-await-in-loop */
const { Plugin, Logger } = require('@unic/estatico-utils');
const Joi = require('joi');

// Config schema used for validation
const schema = Joi.object().keys({
  src: [Joi.string().required(), Joi.array().required()],
  task: Joi.func().required(),
  name: Joi.string().required(),
  once: Joi.boolean(),
  plugins: {
    chokidar: Joi.object().allow(null),
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
  task: null,
  name: null,
  once: false,
  // Passed to https://github.com/paulmillr/chokidar via https://github.com/gulpjs/glob-watcher
  plugins: {
    chokidar: {
      usePolling: false,
    },
  },
  logger: new Logger('estatico-watch'),
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

  const DependencyGraph = require('./lib/dependencygraph');

  let dependencyGraph;

  if (config.dependencyGraph) {
    dependencyGraph = new DependencyGraph(Object.assign({
      paths: config.src,
      logger: config.logger,
    }, config.dependencyGraph));
  }

  let events = [];

  // Create named callback function for gulp-cli to be able to log it
  const cb = {
    [config.name]() {
      const resolvedGraph = dependencyGraph ? dependencyGraph.resolve(events) : [];
      // eslint-disable-next-line max-len
      const matchGraph = dependencyGraph ? dependencyGraph.match.bind(dependencyGraph, resolvedGraph) : null;

      // Remove data files from require cache
      resolvedGraph.forEach(filePath => delete require.cache[require.resolve(filePath)]);

      // Run task function with queued events as parameter
      const watchedTask = config.task({
        events,
        resolvedGraph,
        matchGraph,
      });

      config.logger.debug(`Resolving the following events for "${config.name}": ${events}`);

      // Reset events
      events = [];

      return watchedTask;
    },
  };

  const watcher = gulp.watch(config.src, config.plugins.chokidar, cb[config.name]);

  watcher.on('all', (event, filePath) => {
    events.push({
      event,
      path: filePath,
    });

    // Close after first run if `once` is true
    // Useful when starting a task having its own file watcher (i.e. webpack)
    if (config.once) {
      watcher.close();
    }
  });

  return watcher;
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
