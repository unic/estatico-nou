const test = require('ava');
const sinon = require('sinon');
const utils = require('@unic/estatico-utils').test;
const path = require('path');
const del = require('del');
const { Logger } = require('@unic/estatico-utils');
const task = require('../index.js');

const defaults = {
  src: './test/fixtures/*.html',
  srcBase: './test/fixtures',
  dest: './test/results/',
  logger: new Logger('estatico-w3c-validator'),
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

test('default', t => new Promise((resolve) => {
  task(defaults, {
    dev: true,
  })().on('finish', () => {
    resolve(t.truthy(spy.calledOnce));
  });
}));
