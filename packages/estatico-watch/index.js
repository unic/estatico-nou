const chalk = require('chalk');
const merge = require('lodash.merge');
const { Logger } = require('@unic/estatico-utils');

const logger = new Logger('estatico-watch');

const defaults = {
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
  logger,
};

module.exports = (options, dev) => {
  let config = {};

  if (typeof options === 'function') {
    config = options(defaults);
  } else {
    config = merge({}, defaults, options);
  }

  if (!config.src) {
    config.logger.error(new Error(`${chalk.bold('options.src')} is missing for ${chalk.cyan(options.name)}`), dev);
  }
  if (!config.task) {
    config.logger.error(new Error(`${chalk.bold('options.task')}' is missing for ${chalk.cyan(options.name)}`), dev);
  }
  if (!config.name) {
    config.logger.error(new Error(`${chalk.bold('options.nam')}' is missing for ${chalk.cyan(options.name)}`), dev);
  }

  return () => {
    const gulp = require('gulp'); // eslint-disable-line global-require
    const path = require('path'); // eslint-disable-line global-require
    const decache = require('decache'); // eslint-disable-line global-require

    const DependencyGraph = require('./lib/dependencygraph'); // eslint-disable-line global-require

    let dependencyGraph;

    if (config.dependencyGraph) {
      dependencyGraph = new DependencyGraph(Object.assign({
        paths: config.src,
      }, config.dependencyGraph));
    }

    let events = [];

    // Create named callback function for gulp-cli to be able to log it
    const cb = {
      [config.name]() {
        const resolvedGraph = dependencyGraph ? events.map((event) => {
          const resolvedPath = path.resolve(config.dependencyGraph.srcBase, event.path);
          const ancestors = dependencyGraph.getAncestors(resolvedPath);

          return ancestors.concat(resolvedPath);
        }).reduce((curr, acc) => acc.concat(curr), []) : [];

        // Remove data files from require cache
        resolvedGraph.forEach(decache);

        // Run task function with queued events as parameter
        const task = config.task({
          events,
          resolvedGraph,
        });

        config.logger.debug(config.name, `Resolving the following events: ${events}`);

        // Reset events
        events = [];

        return task;
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
};
