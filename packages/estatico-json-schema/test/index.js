const test = require('ava');
const sinon = require('sinon');
const merge = require('lodash.merge');
const { Logger } = require('@unic/estatico-utils');
const task = require('../index.js');

const defaults = {
  srcBase: './test/fixtures',
  logger: new Logger('estatico-json-schema'),
};

const sandbox = sinon.createSandbox();
let spy;

test.beforeEach('setup logger spy', () => {
  spy = sandbox.spy(defaults.logger, 'error');
});

test.afterEach('teardown logger spy', () => {
  sandbox.restore();
});

test('logs two errors in default/error.js', (t) => {
  const options = merge({}, defaults, {
    src: ['./test/fixtures/default/*.js'],
    plugins: {
      setup: {
        getData: content => content,
        getSchemaPath: () => require.resolve('./fixtures/default/schema.json'),
      },
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

test('logs two errors in variants/error.js', (t) => {
  const options = merge({}, defaults, {
    src: ['./test/fixtures/variants/*.js'],
    plugins: {
      setup: {
        getSchemaPath: () => require.resolve('./fixtures/variants/schema.json'),
      },
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

test('logs one error in refs/error.js', (t) => {
  const options = merge({}, defaults, {
    src: ['./test/fixtures/refs/*.js'],
    plugins: {
      setup: {
        getSchemaPath: () => require.resolve('./fixtures/refs/schema.json'),
      },
    },
  });

  return new Promise((resolve) => {
    task(options, {
      dev: true,
    })().on('finish', () => {
      resolve(t.truthy(spy.calledOnce));
    });
  });
});
