const test = require('ava');
const sinon = require('sinon');
const utils = require('estatico-utils').test;
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

test.cb('default', (t) => {
  const spy = sinon.spy(console, 'log');

  task(defaults, true)().on('end', () => {
    spy.restore();

    const log = utils.stripLogs(spy);

    t.notRegex(log, /'hello' is never reassigned. Use 'const' instead/);
    t.notRegex(log, /estatico-eslint Linting error in file main\.js \(details above\)/);

    utils.compareFiles(t, path.join(__dirname, 'expected/default/*'));

    t.end();
  });
});

test.cb('no fix', (t) => {
  const options = merge({}, defaults, {
    plugins: {
      changed: null,
      eslint: {
        fix: false,
      },
    },
  });

  const spy = sinon.spy(console, 'log');

  task(options, true)().on('finish', () => {
    spy.restore();

    const log = utils.stripLogs(spy);

    t.regex(log, /'hello' is never reassigned. Use 'const' instead/);
    t.regex(log, /estatico-eslint Linting error in file main\.js \(details above\)/);

    t.end();
  });
});

test.afterEach(() => del(path.join(__dirname, '/results')));
