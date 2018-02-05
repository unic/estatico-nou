const util = require('util');
const chalk = require('chalk');
const log = require('fancy-log');

function Logger(plugin) {
  const debug = util.debuglog(plugin);
  const debugExtended = util.debuglog(`${plugin}-extended`);

  return {

    /**
     * Simple info logger
     * @param {*} msg - Log content
     */
    info: (msg) => {
      log(chalk.blue(plugin), msg);
    },

    /**
     * Debug logger
     * @param {string} step - Title of current task step, will be highlighted
     * @param {*} msg - Log content
     * @param {*} [extendedMsg] - Extended log content, will only be logged
     * if `NODE_DEBUG=${plugin}-extended` is set.
     * The current Node version (9.5.0 at the time of writing) seems to support wildcards
     * for sections, so `NODE_DEBUG=${plugin}*` should be fine at some point, too.
     */
    debug: (step, msg, extendedMsg) => {
      // Highlight step
      const label = chalk.yellowBright(step);

      // Simple message (if env variable `NODE_DEBUG=${plugin}` is set)
      debug(label, msg);

      // Extended message (if env variable `NODE_DEBUG=${plugin}-extended` is set)
      // TODO: Find a way of not logging twice
      if (extendedMsg) {
        debugExtended(label, msg, `\n${extendedMsg}`);
      }
    },

    /**
     * Error logger
     * @param {string} step - Title of current task step, will be highlighted
     * @param {Error} err
     * @param {boolean} [dev] - Whether we are in dev mode. Process exits otherwise.
     */
    error: (err, dev) => {
      log(plugin, err.fileName ? chalk.yellow(err.fileName) : '', chalk.red(err.message));

      if (!dev) {
        process.exit(1);
      }
    },
  };
}

module.exports = Logger;
