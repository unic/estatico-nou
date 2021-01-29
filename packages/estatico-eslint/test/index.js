const test = require('ava');
const sinon = require('sinon');
const path = require('path');
const del = require('del');
const merge = require('lodash.merge');
const { Logger } = require('@unic/estatico-utils');
const task = require('../index.js');

const defaults = {
  src: [
    './test/fixtures/*.js',
  ],
  srcBase: './test/fixtures',
  dest: './test/results/',
  logger: new Logger('estatico-eslint'),
};

const sandbox = sinon.createSandbox();
let spy;

test.beforeEach(() => {
  spy = sandbox.spy(defaults.logger, 'error');
});

test.afterEach(() => {
  sandbox.restore();
});

test.afterEach.always(() => {
  del(path.join(__dirname, '/results'));
});

test('logger alerts eslint warnings', t => new Promise((resolve) => {
  task(defaults, {
    dev: true,
    fix: true,
  })().on('end', () => {
    resolve(t.truthy(spy.calledOnce));
  });
}));

test('logger alerts eslint errors', (t) => {
  const options = merge({}, defaults, {
    plugins: {
      changed: null,
    },
  });

  return new Promise((resolve) => {
    task(options, {
      dev: true,
    })().on('finish', () => {
      resolve(t.truthy(spy.calledTwice));
    });
  });
});
