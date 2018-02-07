// const chalk = require('chalk');
const merge = require('lodash.merge');
const { Logger } = require('estatico-utils');

const logger = new Logger('estatico-browsersync');

const defaults = (/* dev */) => ({
  logger,
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
});

module.exports = (options, dev) => {
  let config = {};

  if (typeof options === 'function') {
    config = options(defaults(dev));
  } else {
    config = merge({}, defaults(dev), options);
  }

  // Validate options
  if (!config.plugins.browsersync.server) {
    throw new Error('\'options.plugins.browsersync.server\' is missing');
  }

  return () => {
    const browsersync = require('browser-sync'); // eslint-disable-line global-require

    const bs = browsersync.create();

    // if (config.plugins.browsersync.watch) {
    //   bs.watch(config.plugins.browsersync.watch).on('change', (file) => {
    //     config.logger.info(`Reloading ${chalk.yellow(file)}`);

    //     bs.reload(file);
    //   });
    // }

    bs.init(config.plugins.browsersync);
  };
};
