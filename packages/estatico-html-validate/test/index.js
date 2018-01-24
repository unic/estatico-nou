const test = require('ava');
const sinon = require('sinon');
const stripAnsi = require('strip-ansi');
const path = require('path');
const del = require('del');
const task = require('../index.js');

const defaults = {
  src: './test/fixtures/*.html',
  srcBase: './test/fixtures',
  dest: './test/results/',
};

const stripLog = str => stripAnsi(str.replace(/\n/gm, '').replace(/\t/g, ' ')).replace(/\s\s+/g, ' ');

test.cb('default', (t) => {
  const spy = sinon.spy(console, 'log');

  task(defaults).on('finish', () => {
    spy.restore();

    t.is(stripLog(spy.getCall(0).args.join(' ')), 'HTML Error: index.html Line 9, Column 15: End tag “h3” seen, but there were open elements.');
    t.is(stripLog(spy.getCall(1).args.join(' ')), ' <h2>Hello</h3>');
    t.is(stripLog(spy.getCall(2).args.join(' ')), 'estatico-html-validate (reporter) /Users/me/Sites/Unic/Estatico Nou/estatico-html-validate/test/fixtures/index.html Linting error (details above)');

    t.end();
  });
});

test.afterEach(() => del(path.join(__dirname, '/results')));
