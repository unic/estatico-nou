const test = require('ava');
const del = require('del');
const merge = require('lodash.merge');
const utils = require('@unic/estatico-utils').test;
const task = require('@unic/estatico-puppeteer');
const path = require('path');

const visualRegressions = require('../index.js');

const defaults = {
  src: [
    './test/fixtures/index.html',
  ],
  srcBase: './fixtures',
  plugins: {
    interact: async (page, taskConfig) => {
      // Run tests
      const results = await visualRegressions(page, {
        dest: './test/results/screenshots',
        destDiff: './test/results/diff',
        srcReferences: './test/fixtures/references',
        viewports: taskConfig.viewports,
      });

      // Report results
      visualRegressions.log(results, console);
    },
  },
};

test.cb('default', (t) => {
  task(defaults)().then(() => {
    utils.compareImages(t, path.join(__dirname, 'expected/default/**/*'));
  });
});

test.cb('viewports', (t) => {
  const options = merge({}, defaults, {
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

  task(options)().then(() => {
    utils.compareImages(t, path.join(__dirname, 'expected/viewports/**/*'));
  });
});

test.cb('targets', (t) => {
  const options = merge({}, defaults, {
    plugins: {
      interact: async (page, taskConfig) => {
        const results = await visualRegressions(page, {
          dest: './test/results/screenshots',
          destDiff: './test/results/diff',
          srcReferences: './test/fixtures/references',
          viewports: taskConfig.viewports,
          getTargets: async (pageInstance) => {
            const targets = await pageInstance.$$('.demo');

            return targets;
          },
        });

        visualRegressions.log(results, console);
      },
    },
  });

  task(options)().then(() => {
    utils.compareImages(t, path.join(__dirname, 'expected/targets/**/*'));
  });
});

test.afterEach(() => del(path.join(__dirname, '/results')));
