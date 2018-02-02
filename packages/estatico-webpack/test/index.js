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
  webpack: {
    entry: {
      main: './test/fixtures/main.js',
    },
    output: {
      path: path.resolve('./test/results'),
    },
  },
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
  task(defaults)(() => compare(t, 'default'));
});

test.cb('dev', (t) => {
  task(defaults, true)(() => {
    const hasMinifiedFile = fs.existsSync('./expected/dev/main.min.js');

    t.is(hasMinifiedFile, false);

    compare(t, 'dev');
  });
});

test.afterEach(() => del(path.join(__dirname, '/results')));
