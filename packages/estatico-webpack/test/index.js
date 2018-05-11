const test = require('ava');
// const sinon = require('sinon');
const path = require('path');
const fs = require('fs');
const del = require('del');
const utils = require('@unic/estatico-utils').test;
const merge = require('lodash.merge');
const task = require('../index.js');

const defaults = {
  webpack: {
    entry: {
      main: './test/fixtures/main.js',
    },
    output: {
      path: path.resolve('./test/results'),
      filename: '[name].min.js',
      chunkFilename: 'async/[name].min.js',
      publicPath: '/',
    },
  },
};

test.cb('default', (t) => {
  task(defaults)(() => utils.compareFiles(t, path.join(__dirname, 'expected/default/*')));
});

test.cb('dev', (t) => {
  const options = merge({}, defaults, {
    webpack: {
      output: {
        filename: '[name].js',
        chunkFilename: 'async/[name].js',
      },
      mode: 'development',
    },
  });

  task(options)(() => {
    const hasMinifiedFile = fs.existsSync('./expected/dev/main.min.js');

    t.is(hasMinifiedFile, false);

    utils.compareFiles(t, path.join(__dirname, 'expected/dev/*'));
  });
});

test.cb('async', (t) => {
  const options = merge({}, defaults, {
    webpack: {
      entry: {
        main: './test/fixtures/async.js',
      },
      output: {
        publicPath: '/expected/async/',
      },
    },
  });

  task(options, {
    dev: true,
  })(() => utils.compareFiles(t, path.join(__dirname, 'expected/async/*')));
});

test.afterEach(() => del(path.join(__dirname, '/results')));
