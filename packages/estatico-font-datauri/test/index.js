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

test.cb('default', (t) => {
  task(defaults)().on('finish', () => utils.compareFiles(t, path.join(__dirname, 'expected/default/*')));
});

test.afterEach(() => del(path.join(__dirname, '/results')));
