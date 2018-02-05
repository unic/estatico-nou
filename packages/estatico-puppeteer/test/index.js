const test = require('ava');
const sinon = require('sinon');
const stripAnsi = require('strip-ansi');
const path = require('path');
const del = require('del');
const task = require('../index.js');

const defaults = {
  src: [
    './test/fixtures/index.html',
  ],
  srcBase: './test/fixtures',
};

const stripLog = str => stripAnsi(str.replace(/\n/gm, '').replace(/\t/g, ' ')).replace(/\s\s+/g, ' ');

test.cb('catches JavaScript error', (t) => {
  const spy = sinon.spy(console, 'log');

  task(defaults)().then(() => {
    spy.restore();

    t.is(stripLog(spy.getCall(1).args.join(' ')).replace(/ at file:(.*)/m, ''), 'estatico-puppeteer index.html ReferenceError: bla is not defined');

    t.end();
  });
});

test.afterEach(() => del(path.join(__dirname, '/results')));
