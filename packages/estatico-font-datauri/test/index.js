const test = require('ava');
const utils = require('@unic/estatico-utils').test;
const path = require('path');
const del = require('del');
const task = require('../index.js');

const defaults = {
  src: [
    './test/fixtures/default/*',
  ],
  dest: './test/results/',
  plugins: {
    concat: 'fonts.scss',
  },
};

test('default', t => new Promise((resolve) => {
  task(defaults)()
    .on('finish', () => {
      const pairsMatch = utils.compareFiles(path.join(__dirname, 'expected/default/*'));
      resolve(t.truthy(pairsMatch));
    });
}));

test.afterEach(() => del(path.join(__dirname, '/results')));
