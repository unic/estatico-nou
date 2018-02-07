/* eslint-disable no-await-in-loop */
const chalk = require('chalk');
const merge = require('lodash.merge');
const { Logger } = require('estatico-utils');

const logger = new Logger('estatico-puppeteer');

const defaults = (/* dev */) => ({
  src: null,
  srcBase: null,
  viewports: null,
  plugins: {
    puppeteer: {
    },
    // interact: async (page) => {
    // },
  },
  logger,
});

module.exports = (options, dev) => {
  let config = {};

  if (typeof options === 'function') {
    config = options(defaults(dev));
  } else {
    config = merge({}, defaults(dev), options);
  }

  // Validate options
  if (!config.src) {
    throw new Error('\'options.src\' is missing');
  }
  if (!config.srcBase) {
    throw new Error('\'options.srcBase\' is missing');
  }

  return () => {
    const puppeteer = require('puppeteer'); // eslint-disable-line global-require
    const glob = require('glob'); // eslint-disable-line global-require
    const path = require('path'); // eslint-disable-line global-require

    // Create array of file paths from array of globs
    const files = config.src.map(fileGlob => glob.sync(fileGlob))
      .reduce((acc, curr) => acc.concat(curr), [])
      .map(filePath => path.resolve(filePath));

    return puppeteer.launch(config.plugins.puppeteer).then(async (browser) => {
      const page = await browser.newPage();
      let error;

      // TODO: Find a way to throw in here
      page.on('pageerror', (err) => {
        error = err;
      });

      // page.on('error', console.log);

      // page.on('console', (msg) => {
      //   console.log(msg.text());
      // });

      // page.on('request', function(req) {
      //  if (!req.url.match(/data\:/)) {
      //    console.log(req.url);
      //  }
      // });

      // eslint-disable-next-line no-restricted-syntax
      for (const file of files) {
        config.logger.info(`Testing ${chalk.yellow(path.relative(config.srcBase, file))}`);

        await page.goto(`file://${file}`);

        // Interact with page (evaluating code, taking screenshots etc.)
        if (config.plugins.interact) {
          try {
            if (config.viewports) {
              // eslint-disable-next-line no-restricted-syntax
              for (const viewport of Object.keys(config.viewports)) {
                config.logger.info(`Testing viewport ${chalk.yellow(viewport)}`);

                await page.setViewport(config.viewports[viewport]);
                await config.plugins.interact(page);
              }
            } else {
              await config.plugins.interact(page);
            }
          } catch (err) {
            error = err;
          }
        }

        // Handle errors: Exit on error (see note in 'pageerror' handler)
        if (error) {
          error.fileName = path.relative(config.srcBase, file);

          config.logger.error(error, dev);

          error = null;

          if (!dev) {
            await browser.close();

            break;
          }
        }
      }

      await browser.close();
    });
  };
};
