const test = require('ava');
const del = require('del');
const merge = require('lodash.merge');
const utils = require('@unic/estatico-utils').test;
const task = require('@unic/estatico-puppeteer');
const puppeteer = require('puppeteer');
const path = require('path');

const visualRegressions = require('../index.js');

const defaults = {
  dest: './test/results/screenshots',
  destDiff: './test/results/diff',
  srcReferences: './test/fixtures/references',
};

const getConfig = options => ({
  src: ['./test/fixtures/index.html'],
  srcBase: './fixtures',
  plugins: {
    interact: async (page, taskConfig) => {
      // Run tests
      const results = await visualRegressions(page, merge({
        viewports: taskConfig.viewports,
      }, defaults, options));

      // Report results
      visualRegressions.log(results, console);
    },
  },
});

test.cb('default', (t) => {
  const config = getConfig();

  task(config)().then(() => {
    utils.compareImages(t, path.join(__dirname, 'expected/default/**/*'));
  });
});

test.cb('diff', (t) => {
  const config = merge({}, getConfig(), {
    src: ['./test/fixtures/diff.html'],
  });

  task(config)().then(() => {
    utils.compareImages(t, path.join(__dirname, 'expected/diff/**/*'));
  });
});

test.cb('viewports', (t) => {
  const config = merge({}, getConfig(), {
    viewports: {
      mobile: {
        width: 400,
        height: 1000,
        isMobile: true,
      },
      desktop: {
        width: 1400,
        height: 1000,
      },
    },
  });

  task(config)().then(() => {
    utils.compareImages(t, path.join(__dirname, 'expected/viewports/**/*'));
  });
});

test.cb('targets', (t) => {
  const config = getConfig({
    getTargets: async (pageInstance) => {
      const targets = await pageInstance.$$('.demo');

      return targets;
    },
  });

  task(config)().then(() => {
    utils.compareImages(t, path.join(__dirname, 'expected/targets/**/*'));
  });
});

test.cb('tabs', (t) => {
  const config = merge({}, getConfig({
    getTargets: async (pageInstance) => {
      const targets = await pageInstance.$$('.demo');

      return targets.map(async (target) => {
        await pageInstance.evaluate((element) => {
          element.style.display = 'block'; // eslint-disable-line no-param-reassign
        }, target);

        return target;
      });
    },
  }), {
    src: ['./test/fixtures/tabs.html'],
  });

  task(config)().then(() => {
    utils.compareImages(t, path.join(__dirname, 'expected/tabs/**/*'));
  });
});

test.cb('puppeteer', (t) => {
  puppeteer.launch().then(async (browser) => {
    const page = await browser.newPage();

    await page.goto(`file://${path.resolve('./test/fixtures/index.html')}`);

    const results = await visualRegressions(page, defaults);

    console.log(results);

    await browser.close();
  }).then(() => {
    utils.compareImages(t, path.join(__dirname, 'expected/puppeteer/**/*'));
  }).catch(console.log);
});

test.afterEach(() => del(path.join(__dirname, '/results')));
