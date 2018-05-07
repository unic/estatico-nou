/* eslint-disable global-require */
function plugin({
  defaults,
  schema,
  options,
  task,
  env = {},
}) {
  const merge = require('lodash.merge');
  const Joi = require('joi');
  const gulp = require('gulp');

  let config = {};

  // Either merge or transform options
  if (typeof options === 'function') {
    config = options(defaults(env));
  } else {
    config = merge({}, defaults(env), options);
  }

  // Validate options
  const validate = Joi.validate(config, schema, {
    allowUnknown: true,
  });

  if (validate.error) {
    config.logger.error(new Error(`Config validation: ${validate.error}`), env.dev);
  }

  // Add optional watcher
  if (env.watch && config.watch) {
    const watchConfig = merge({}, {
      task: task.bind(null, config, env),
    }, config.watch);

    if (config.watch.dependencyGraph && config.watch.dependencyGraph.watcher) {
      config.watch.dependencyGraph.watcher(watchConfig)();
    } else {
      // Create named callback function for gulp-cli to be able to log it
      const cb = {
        [config.watch.name]() {
          return watchConfig.task();
        },
      };

      gulp.watch(watchConfig.src, cb[config.watch.name]);
    }
  }

  // Return configured task function
  return task.bind(null, config, env);
}

module.exports = plugin;
