const test = require('ava');
const utils = require('@unic/estatico-utils').test;
const path = require('path');
const del = require('del');
const merge = require('lodash.merge');
const task = require('../index.js');

const defaults = {
  src: {
    main: './test/fixtures/main/*.svg',
    custom: './test/fixtures/custom/*.svg',
  },
  srcBase: './test/fixtures/',
  dest: './test/results/',
};

// TODO: => Debug matching result/expected still fails
test.skip('default', t => new Promise((resolve) => {
  task(defaults)()
    .on('finish', () => {
      const pairsMatch = utils.compareFiles(path.join(__dirname, 'expected/default/*'));
      resolve(t.truthy(pairsMatch));
    });
}));

test('unomptimized', (t) => {
  const options = merge({}, defaults, {
    plugins: {
      imagemin: null,
    },
  });

  return new Promise((resolve) => {
    task(options)()
      .on('finish', () => {
        const pairsMatch = utils.compareFiles(path.join(__dirname, 'expected/unomptimized/*'));
        resolve(t.truthy(pairsMatch));
      });
  });
});

// test.afterEach.always(() => del(path.join(__dirname, '/results')));
