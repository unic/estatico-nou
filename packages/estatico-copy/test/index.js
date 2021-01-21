const test = require('ava');
const utils = require('@unic/estatico-utils').test;
const path = require('path');
const del = require('del');
const merge = require('lodash.merge');
const task = require('../index.js');

const defaults = {
  src: [
    './test/fixtures/default/*',
  ],
  srcBase: './test/fixtures/default/',
  dest: './test/results/',
  plugins: {
    changed: null,
  },
};

test.afterEach(() => del(path.join(__dirname, '/results')));

test('default', t => new Promise((resolve) => {
  task(defaults)()
    .on('finish', () => {
      const pairsMatch = utils.compareFiles(path.join(__dirname, 'expected/default/*'));
      resolve(t.truthy(pairsMatch));
    });
}));

test('rename', (t) => {
  const options = merge({}, defaults, {
    plugins: {
      rename: filePath => filePath.replace(path.basename(filePath), `new-${path.basename(filePath)}`),
    },
  });

  return new Promise((resolve) => {
    task(options)()
      .on('finish', () => {
        const pairsMatch = utils.compareFiles(path.join(__dirname, 'expected/rename/*'));
        resolve(t.truthy(pairsMatch));
      });
  });
});
