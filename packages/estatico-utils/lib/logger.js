/* eslint-disable global-require */
function Logger(pluginName) {
  const util = require('util');
  const chalk = require('chalk');
  const log = require('fancy-log');

  const debugLogger = util.debuglog(pluginName);
  const debugLoggerExtended = util.debuglog(`${pluginName}-extended`);

  /**
   * Simple info logger
   * @param {*} msg - Log content
   */
  const info = (msg) => {
    log(chalk.blue(pluginName), msg);
  };

  /**
   * Debug logger
   * @param {string} step - Title of current task step, will be highlighted
   * @param {*} msg - Log content
   * @param {*} [extendedMsg] - Extended log content, will only be logged
   * if `NODE_DEBUG=${pluginName}-extended` is set.
   * The current Node version (9.5.0 at the time of writing) seems to support wildcards
   * for sections, so `NODE_DEBUG=${pluginName}*` should be fine at some point, too.
   */
  const debug = (step, msg, extendedMsg) => {
    // Highlight step
    const label = chalk.yellowBright(step);

    // Simple message (if env variable `NODE_DEBUG=${pluginName}` is set)
    debugLogger(label, msg);

    // Extended message (if env variable `NODE_DEBUG=${pluginName}-extended` is set)
    // TODO: Find a way of not logging twice
    if (extendedMsg) {
      debugLoggerExtended(label, msg, `\n${extendedMsg}`);
    }
  };

  /**
   * Error logger
   * @param {string} step - Title of current task step, will be highlighted
   * @param {Error} err
   * @param {boolean} [dev] - Whether we are in dev mode. Process exits otherwise.
   */
  const error = (err, dev) => {
    log(chalk.blue(pluginName), err.fileName ? chalk.yellow(err.fileName) : '', chalk.red(err.message));

    if (err.stack) {
      debugLogger(chalk.red(pluginName), err.stack);
    }

    if (!dev) {
      process.exit(1);
    }
  };


  return {
    info,
    debug,
    error,
  };
}

module.exports = Logger;
