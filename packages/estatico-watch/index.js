const merge = require('lodash.merge');
const gulp = require('gulp');

const defaults = {
  once: false,
  // Passed to https://github.com/paulmillr/chokidar via https://github.com/gulpjs/glob-watcher
  watcher: {
    usePolling: false,
  },
};

module.exports = (options) => {
  const config = merge({}, defaults, options);

  if (!config.src) {
    throw new Error('No watch path specified');
  }

  if (!config.task) {
    throw new Error('No task function specified');
  }

  let events = [];

  // Create named callback function for gulp-cli to be able to log it
  const cb = {
    [config.task.name]() {
      // Run task function with queued events as parameter
      const task = config.task(events);

      // Reset events
      events = [];

      return task;
    },
  };

  const watcher = gulp.watch(config.src, config.watcher, cb[config.task.name]);

  watcher.on('all', (event, path) => {
    events.push({
      event,
      path,
    });

    // Close after first run if `once` is true
    // Useful when starting a task having its own file watcher (i.e. webpack)
    if (config.once) {
      watcher.close();
    }
  });

  return watcher;
};
