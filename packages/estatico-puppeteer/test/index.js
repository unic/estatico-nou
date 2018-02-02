const test = require('ava');
const sinon = require('sinon');
const glob = require('glob');
const stripAnsi = require('strip-ansi');
const path = require('path');
const fs = require('fs');
const del = require('del');
const merge = require('lodash.merge');
const task = require('../index.js');

const defaults = {
  src: './test/fixtures/main.scss',
  srcBase: './test/fixtures/',
  dest: './test/results/',
};

const compare = (t, name) => {
  const expected = glob.sync(path.join(__dirname, `expected/${name}/*`), {
    nodir: true,
  });

  expected.forEach((filePath) => {
    const expectedFile = fs.readFileSync(filePath).toString();
    const resultedFile = fs.readFileSync(filePath.replace(`expected/${name}`, 'results')).toString();

    t.is(expectedFile, resultedFile);
  });

  t.end();
};

const stripLog = str => stripAnsi(str.replace(/\n/gm, '').replace(/\t/g, ' ')).replace(/\s\s+/g, ' ');

test.cb('default', (t) => {
  task(defaults)().on('end', () => compare(t, 'default'));
});

test.cb('unminified', (t) => {
  task(defaults, true)().on('end', () => compare(t, 'unminified'));
});

test.cb('error', (t) => {
  const options = merge({}, defaults, {
    src: './test/fixtures/error.scss',
  });

  const spy = sinon.spy(console, 'log');

  task(options)().on('end', () => {
    spy.restore();

    t.is(stripLog(spy.getCall(0).args.join(' ')), 'estatico-sass (gulp-sass) undefined test/fixtures/error.scssError: Invalid CSS after "a": expected 1 selector or at-rule, was "a " on line 1 of test/fixtures/error.scss>> a ^');

    t.end();
  });
});

test.afterEach(() => del(path.join(__dirname, '/results')));
