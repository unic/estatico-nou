const test = require('ava');
const sinon = require('sinon');
const utils = require('@unic/estatico-utils').test;
const path = require('path');
const del = require('del');
const merge = require('lodash.merge');
const task = require('../index.js');

const defaults = {
  src: [
    './test/fixtures/*.js',
  ],
  srcBase: './test/fixtures',
  dest: './test/results/',
};

test.cb('with --fix', (t) => {
  const spy = sinon.spy(console, 'log');

  task(defaults, {
    dev: true,
    fix: true,
  })().on('end', () => {
    spy.restore();

    const log = utils.stripLogs(spy);

    t.notRegex(log, /'hello' is never reassigned. Use 'const' instead/);
    t.notRegex(log, /estatico-eslint Linting error in file main\.js \(details above\)/);

    utils.compareFiles(t, path.join(__dirname, 'expected/default/*'));

    t.end();
  });
});

test.cb('without --fix', (t) => {
  const options = merge({}, defaults, {
    plugins: {
      changed: null,
    },
  });

  const spy = sinon.spy(console, 'log');

  task(options, {
    dev: true,
  })().on('finish', () => {
    spy.restore();

    const log = utils.stripLogs(spy);

    t.regex(log, /'hello' is never reassigned. Use 'const' instead/);
    t.regex(log, /estatico-eslint Linting error in file main\.js \(details above\)/);

    t.end();
  });
});

test.afterEach(() => del(path.join(__dirname, '/results')));
