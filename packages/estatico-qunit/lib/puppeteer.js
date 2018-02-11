/* globals QUnit */
const chalk = require('chalk');

module.exports = {
  run: async (page) => {
    // eslint-disable-next-line no-undef
    const isDone = await page.evaluate(() => typeof QUnit !== 'undefined' && QUnit.isDone);

    // We cannot run QUnit tests twice without reloading
    if (isDone) {
      await page.reload();
    }

    const results = await page.evaluate(() => new Promise((resolve) => { // eslint-disable-line
      if (typeof QUnit === 'undefined') {
        return resolve();
      }

      const details = [];

      QUnit.start();

      QUnit.testDone((result) => {
        details.push(result);
      });

      QUnit.done((summary) => {
        resolve({
          details,
          summary,
        });

        QUnit.isDone = true;
      });
    }));

    return results;
  },
  log: (results, logger) => {
    results.details.forEach((test) => {
      if (test.failed === 0) {
        logger.info(chalk.green(`✓ ${test.name}`));
      } else {
        logger.info(chalk.red(`× ${test.name}`));

        test.assertions.filter(assertion => !assertion.result).forEach((assertion) => {
          logger.info(chalk.red(`Failing assertion: ${assertion.message}`));
        });
      }
    });

    if (results.summary.failed > 0) {
      throw new Error('QUnit error');
    }
  },
};
