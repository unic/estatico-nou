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

test.cb('default', (t) => {
  task(defaults)().on('finish', () => utils.compareFiles(t, path.join(__dirname, 'expected/default/*')));
});

test.cb('rename', (t) => {
  const options = merge({}, defaults, {
    plugins: {
      rename: filePath => filePath.replace(path.basename(filePath), `new-${path.basename(filePath)}`),
    },
  });

  task(options)().on('finish', () => utils.compareFiles(t, path.join(__dirname, 'expected/rename/*')));
});

test.afterEach(() => del(path.join(__dirname, '/results')));
