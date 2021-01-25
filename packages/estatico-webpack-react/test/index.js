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

// test.afterEach.always(() => del(path.join(__dirname, '/results')));

test.cb.only('default', (t) => {
  task(defaults)(() => {
    t.is(fs.existsSync(path.join(__dirname, './results/main.js')), true);
    t.is(fs.existsSync(path.join(__dirname, './results/main.min.js')), true);
    t.end();
  });
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
    t.is(fs.existsSync(path.join(__dirname, './results/main.js')), true);
    t.is(fs.existsSync(path.join(__dirname, './results/main.min.js')), false);

    t.end();
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
  })(() => {
    t.is(fs.existsSync(path.join(__dirname, './results/async/hello-bar.js')), true);

    t.end();
  });
});
