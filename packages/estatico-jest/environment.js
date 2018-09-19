const NodeEnvironment = require('jest-environment-node');
const puppeteer = require('puppeteer');
const fs = require('fs');

class PuppeteerEnvironment extends NodeEnvironment {
  async setup() {
    await super.setup();

    const config = JSON.parse(fs.readFileSync('./.tmp-test-config.json', 'utf8'));

    // Connect to Puppeteer instance and expose globally
    this.global.__BROWSER__ = await puppeteer.connect({
      browserWSEndpoint: config.browserEndpoint,
    });

    // Expose port
    this.global.__STATIC_PORT__ = config.staticPort;
  }

  async teardown() {
    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = PuppeteerEnvironment;
