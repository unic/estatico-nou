const log = require('fancy-log');
const chalk = require('chalk');
const merge = require('lodash.merge');
const tests = require('./lib/qunit');

const defaults = (/* dev */) => ({
  src: null,
  srcBase: null,
  plugins: {
    puppeteer: {
    },
  },
  errorHandler: (err) => {
    log(`estatico-puppeteer${err.plugin ? ` (${err.plugin})` : ''}`, chalk.cyan(err.fileName), chalk.red(err.message));
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

    return puppeteer.launch({
      // headless: false
    }).then(async (browser) => {
      const page = await browser.newPage();
      let error;

      // TODO: Find a way to throw in here
      page.on('pageerror', (err) => {
        error = err;
      });

      page.on('error', console.log);

      // page.on('console', (msg) => {
      //   console.log(msg.text());
      // });

      // page.on('request', function(req) {
      //  if (!req.url.match(/data\:/)) {
      //    console.log(req.url);
      //  }
      // });

      for (const file of files) { // eslint-disable-line no-restricted-syntax
        log(chalk.cyan('Testing'), path.relative(config.srcBase, file));

        await page.goto(`file://${file}`); // eslint-disable-line no-await-in-loop

        // Run Qunit tests
        const results = await tests.run(page); // eslint-disable-line no-await-in-loop

        // Report results
        if (results) {
          try {
            tests.logResults(results);
          } catch (err) {
            error = err;
          }
        }

        // Handle errors: Exit on error (see note in 'pageerror' handler)
        if (error) {
          error.fileName = path.relative(config.srcBase, file);

          config.errorHandler(error);

          error = null;

          if (!dev) {
            await browser.close(); // eslint-disable-line no-await-in-loop

            break;
          }
        }
      }

      await browser.close();
    });
  };
};
