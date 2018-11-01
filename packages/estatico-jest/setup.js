const puppeteer = require('puppeteer');
const fs = require('fs');
const handler = require('serve-handler');
const http = require('http');

async function launchPuppeteer(config) {
  const browser = await puppeteer.launch(config);
  const browserEndpoint = browser.wsEndpoint();

  // Store browser instance so we can tear it down in the end
  // This global is only available in the teardown but not in tests
  global.__BROWSER_GLOBAL__ = browser;

  return browserEndpoint;
}

function launchStaticServer(config) {
  const server = http.createServer((request, response) => handler(request, response, {
    public: config.dir,
  }));

  // Expose port to teardown
  global.__STATIC_PORT_GLOBAL__ = config.port;

  // Start server
  return new Promise((resolve) => {
    server.listen(config.port, () => {
      console.log(`Static build served on http://localhost:${config.port}`);

      resolve(config.port);
    });
  });
}

module.exports = async (globalConfig) => {
  const customServerConfig = globalConfig.projects ? globalConfig.projects[0].puppeteerServer : null; // eslint-disable-line max-len
  const serverConfig = Object.assign({
    port: 3000,
    dir: './dist',
  }, customServerConfig);

  // Start puppeteer and expose connection ednpoint
  const browserEndpoint = await launchPuppeteer(serverConfig.puppeteer);

  // Serve static build on port 3000
  const staticPort = await launchStaticServer(serverConfig);

  // Use the file system to expose the config to tests
  fs.writeFileSync('./.tmp-test-config.json', JSON.stringify({
    browserEndpoint,
    staticPort,
  }));
};
