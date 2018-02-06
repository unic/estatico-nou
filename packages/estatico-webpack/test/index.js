const test = require('ava');
// const sinon = require('sinon');
const path = require('path');
const fs = require('fs');
const del = require('del');
const utils = require('estatico-utils').test;
const task = require('../index.js');

const defaults = {
  webpack: {
    entry: {
      main: './test/fixtures/main.js',
    },
    output: {
      path: path.resolve('./test/results'),
    },
  },
};

test.cb('default', (t) => {
  task(defaults)(() => utils.compareFiles(t, path.join(__dirname, 'expected/default/*')));
});

test.cb('dev', (t) => {
  task(defaults, true)(() => {
    const hasMinifiedFile = fs.existsSync('./expected/dev/main.min.js');

    t.is(hasMinifiedFile, false);

    utils.compareFiles(t, path.join(__dirname, 'expected/dev/*'));
  });
});

test.afterEach(() => del(path.join(__dirname, '/results')));
