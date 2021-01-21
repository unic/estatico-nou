const test = require('ava');
const sinon = require('sinon');
const path = require('path');
const del = require('del');
const { Logger } = require('@unic/estatico-utils');
const task = require('../index.js');

const defaults = {
  src: [
    './test/fixtures/index.html',
  ],
  srcBase: './test/fixtures',
  logger: new Logger('estatico-puppeteer'),
};

const sandbox = sinon.createSandbox();
let spy;

test.beforeEach(() => {
  spy = sandbox.spy(defaults.logger, 'error');
});

test.afterEach(() => {
  sandbox.restore();
});

test('Catches JavaScript error', t => task(defaults, {
  dev: true,
})().then(() => {
  t.log(spy);
  t.pass();
}));

test.afterEach(() => del(path.join(__dirname, '/results')));
