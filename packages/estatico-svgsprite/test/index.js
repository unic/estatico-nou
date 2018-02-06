const test = require('ava');
const utils = require('estatico-utils').test;
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

test.cb('default', (t) => {
  task(defaults)().on('finish', () => utils.compareFiles(t, path.join(__dirname, 'expected/default/*')));
});

test.cb('unomptimized', (t) => {
  const options = merge({}, defaults, {
    plugins: {
      imagemin: null,
    },
  });

  task(options)().on('finish', () => utils.compareFiles(t, path.join(__dirname, 'expected/unomptimized/*')));
});

test.afterEach(() => del(path.join(__dirname, '/results')));
