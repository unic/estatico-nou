const test = require('ava');
const sinon = require('sinon');
const path = require('path');
const del = require('del');
const utils = require('@unic/estatico-utils').test;
const task = require('../index.js');

const defaults = {
  src: [
    './test/fixtures/index.html',
  ],
  srcBase: './test/fixtures',
};

test.cb('Catches JavaScript error', (t) => {
  const spy = sinon.spy(process.stdout, 'write');

  task(defaults, {
    dev: true,
  })().then(() => {
    spy.restore();

    const log = utils.stripLogs(spy);

    t.regex(log, /estatico-puppeteer index\.html ReferenceError: bla is not defined/);

    t.end();
  });
});

test.afterEach(() => del(path.join(__dirname, '/results')));
