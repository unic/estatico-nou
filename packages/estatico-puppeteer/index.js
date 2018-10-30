/* eslint-disable global-require, no-await-in-loop */
const { Plugin, Logger } = require('@unic/estatico-utils');
const Joi = require('joi');

// Config schema used for validation
const schema = Joi.object().keys({
  src: [Joi.string().required(), Joi.array().required()],
  srcBase: Joi.string().required(),
  watch: Joi.object().keys({
    src: [Joi.string().required(), Joi.array().required()],
    name: Joi.string().required(),
  }).allow(null),
  viewports: Joi.object().allow(null),
  plugins: {
    puppeteer: Joi.object().allow(null),
    pool: Joi.object().allow(null),
    interact: Joi.func().allow(null),
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
  viewports: null,
  plugins: {
    puppeteer: {
    },
    pool: {
      max: 10,
    },
    // interact: async (page, logger) => {
    // },
  },
  logger: new Logger('estatico-puppeteer'),
});

/**
 * Task function
 * @param {object} config - Complete task config
 * @param {object} env - Environment config, e.g. { dev: true }
 * @param {object} [watcher] - Watch file events (requires `@unic/estatico-watch`)
 * @return {object} gulp stream
 */
const task = (config, env = {}) => {
  const puppeteer = require('puppeteer');
  const glob = require('glob');
  const path = require('path');
  const chalk = require('chalk');
  const genericPool = require('generic-pool');

  // Create array of file paths from array of globs
  const files = config.src.map(fileGlob => glob.sync(fileGlob))
    .reduce((acc, curr) => acc.concat(curr), [])
    .map(filePath => path.resolve(filePath));

  return puppeteer.launch(config.plugins.puppeteer).then(async (browser) => {
    let error;

    const pageFactory = {
      create: async () => {
        const page = await browser.newPage();

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

        return page;
      },
      destroy: page => page.close(),
    };

    // Create pool of pages
    const pagePool = genericPool.createPool(pageFactory, config.plugins.pool);

    // Create array of test promises
    const tests = files.map(async (file) => {
      // Get available page
      const page = await pagePool.acquire();
      const filePathLog = chalk.yellow(path.relative(config.srcBase, file));

      // Open file
      await page.goto(`file://${file}`);

      // Interact with page (evaluating code, taking screenshots etc.)
      if (config.plugins.interact) {
        try {
          if (config.viewports) {
            // eslint-disable-next-line no-restricted-syntax
            for (const viewport of Object.keys(config.viewports)) {
              config.logger.info(`Testing ${filePathLog} in viewport ${chalk.yellow(viewport)}`);

              await page.setViewport(config.viewports[viewport]);
              await config.plugins.interact(page, config.logger);
            }
          } else {
            config.logger.info(`Testing ${filePathLog}`);

            await config.plugins.interact(page, config.logger);
          }
        } catch (err) {
          error = err;
        }
      } else {
        config.logger.info(`Opening ${filePathLog}`);
      }

      // Handle errors: Exit on error (see note in 'pageerror' handler)
      if (error) {
        error.fileName = path.relative(config.srcBase, file);

        if (!env.dev) {
          throw error;
        }

        config.logger.error(error, env.dev);

        error = null;
      }

      // Release page to next test
      pagePool.release(page);
    });

    // Wait for all tests to finish
    return Promise.all(tests).catch(async (err) => {
      // Error logger exits in non-dev mode, close browser before
      if (!env.dev) {
        await browser.close();
      }

      config.logger.error(err, env.dev);
    }).then(() => browser.close());
  });
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
