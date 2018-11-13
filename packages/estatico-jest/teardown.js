const util = require('util');
const fs = require('fs');
const lsofi = require('lsofi');
const terminate = require('terminate');

const asyncTerminate = util.promisify(terminate);

module.exports = async () => {
  // Close puppeteer browser instance
  await global.__BROWSER_GLOBAL__.close();

  // Delete file used to expose config data
  fs.unlinkSync('./.tmp-test-config.json');

  // Find and stop static server
  const port = await lsofi(global.__STATIC_PORT_GLOBAL__);

  if (port) {
    await asyncTerminate(port);
  } else {
    throw new Error(`
  Jest teardown: No process found on port ${global.__STATIC_PORT_GLOBAL__}, static file server was apparently stopped already or cannot be found.
  This is not an issue with the tests themselves and might be ignored, however, in the latter case you will end up with a running process on the port specified in the jest config.
  Throwing this error will make sure Jest properly stops anyway.
`);
  }
};
