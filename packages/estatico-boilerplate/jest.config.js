const path = require('path');

const dir = path.dirname(require.resolve('@unic/estatico-jest'));

module.exports = {
  globalSetup: path.join(dir, './setup.js'),
  globalTeardown: path.join(dir, './teardown.js'),
  testEnvironment: path.join(dir, './environment.js'),
  testRegex: 'src/.*\\.test\\.js$',
  projects: [{
    // This seems to be the only way for now to pass options to setup.js
    // https://github.com/facebook/jest/issues/5957#issuecomment-422027349
    projects: [{
      // We temporarily run a static webserver where Puppeteer can access our HTML
      puppeteerServer: {
        port: 3000,
        dir: './dist',
      },
    }],
  }],
};
