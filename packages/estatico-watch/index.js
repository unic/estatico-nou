const merge = require('lodash.merge');

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
};

module.exports = (options) => {
  let config = {};

  if (typeof options === 'function') {
    config = options(defaults);
  } else {
    config = merge({}, defaults, options);
  }

  if (!config.src) {
    throw new Error('\'options.src\' is missing');
  }
  if (!config.task) {
    throw new Error('\'options.task\' is missing');
  }
  if (!config.name) {
    throw new Error('\'options.name\' is missing');
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
