const log = require('fancy-log');
const chalk = require('chalk');

module.exports = {
  run: async (page) => {
    const results = await page.evaluate(() => new Promise((resolve) => { // eslint-disable-line
      if (typeof QUnit === 'undefined') {
        return resolve();
      }

      const details = [];

      QUnit.start(); // eslint-disable-line no-undef

      QUnit.testDone((result) => { // eslint-disable-line no-undef
        details.push(result);
      });

      QUnit.done((summary) => { // eslint-disable-line no-undef
        resolve({
          details,
          summary,
        });
      });
    }));

    return results;
  },
  log: (results) => {
    results.details.forEach((test) => {
      if (test.failed === 0) {
        log(chalk.green(`✓ ${test.name}`));
      } else {
        log(chalk.red(`× ${test.name}`));

        test.assertions.filter(assertion => !assertion.result).forEach((assertion) => {
          log(chalk.red(`Failing assertion: ${assertion.message}`));
        });
      }
    });

    if (results.summary.failed > 0) {
      throw new Error('QUnit error');
    }
  },
};
