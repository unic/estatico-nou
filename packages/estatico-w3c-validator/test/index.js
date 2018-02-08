const test = require('ava');
const sinon = require('sinon');
const utils = require('@unic/estatico-utils').test;
const path = require('path');
const del = require('del');
const task = require('../index.js');

const defaults = {
  src: './test/fixtures/*.html',
  srcBase: './test/fixtures',
  dest: './test/results/',
};

test.cb('default', (t) => {
  const spy = sinon.spy(console, 'log');

  task(defaults, {
    dev: true,
  })().on('finish', () => {
    spy.restore();

    const log = utils.stripLogs(spy);

    t.regex(log, /HTML Error: index.html Line 9, Column 15: End tag “h3” seen, but there were open elements./);

    t.end();
  });
});

test.afterEach(() => del(path.join(__dirname, '/results')));
