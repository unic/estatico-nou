const Logger = require('./lib/logger');
const test = require('./lib/test');
const Plugin = require('./lib/plugin');
const readFileSyncCached = require('./lib/cache');

module.exports = {
  Logger,
  test,
  Plugin,
  readFileSyncCached,
};
