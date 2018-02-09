const test = require('ava');
const sinon = require('sinon');
const utils = require('@unic/estatico-utils').test;
const path = require('path');
const del = require('del');
const merge = require('lodash.merge');
const task = require('../index.js');

const defaults = {
  src: './test/fixtures/main.scss',
  srcBase: './test/fixtures/',
  dest: './test/results/',
};

test.cb('default', (t) => {
  task(defaults)().on('end', () => utils.compareFiles(t, path.join(__dirname, 'expected/default/*')));
});

test.cb('unminified', (t) => {
  task(defaults, {
    dev: true,
  })().on('end', () => utils.compareFiles(t, path.join(__dirname, 'expected/unminified/*')));
});

test.cb('error', (t) => {
  const options = merge({}, defaults, {
    src: './test/fixtures/error.scss',
  });

  const spy = sinon.spy(console, 'log');

  task(options, {
    dev: true,
  })().on('end', () => {
    spy.restore();

    const log = utils.stripLogs(spy);

    t.regex(log, /estatico-sass test\/fixtures\/error\.scssError: Invalid CSS after "a"/);

    t.end();
  });
});

test.cb('custom autoprefixer options', (t) => {
  const options = merge({}, defaults, {
    plugins: {
      postcss: [
        require('autoprefixer')({
          browsers: ['last 10 versions'],
        }),
      ],
    },
  });

  task(options)().on('end', () => utils.compareFiles(t, path.join(__dirname, 'expected/autoprefixer/*')));
});

test.afterEach(() => del(path.join(__dirname, '/results')));
