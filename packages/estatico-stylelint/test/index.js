const test = require('ava');
const sinon = require('sinon');
const stripAnsi = require('strip-ansi');
const path = require('path');
const del = require('del');
const task = require('../index.js');

const defaults = {
  src: [
    './test/fixtures/*.scss',
  ],
  srcBase: './test/fixtures',
  dest: './test/results/',
};

const stripLog = str => stripAnsi(str.replace(/\n/gm, '').replace(/\t/g, ' ')).replace(/\s\s+/g, ' ');

test.cb('default', (t) => {
  const spy = sinon.spy(console, 'log');

  task(defaults).on('end', () => {
    spy.restore();

    t.is(stripLog(spy.getCall(0).args.join(' ')), 'estatico-stylelint (gulp-stylelint) undefined Failed with 1 error');

    t.end();
  });
});

test.afterEach(() => del(path.join(__dirname, '/results')));
