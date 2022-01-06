const test = require('ava');
const sinon = require('sinon');
const utils = require('@unic/estatico-utils').test;
const path = require('path');
const merge = require('lodash.merge');
const task = require('../index.js');
const { readFileSync, writeFileSync } = require('fs');

const defaults = {
  src: [
    './test/fixtures/*.js',
  ],
  srcBase: './test/fixtures',
  dest: './test/results/',
};

test.cb('runs just to lint', (t) => {
  const spy = sinon.spy(console, 'log');
  const options = merge({}, defaults, {
    plugins: {
      changed: null,
    },
  });

  task(options, {
    dev: true,
  })().on('finish', () => {
    spy.restore();
    const log = utils.stripLogs(spy);

    // the monitored console output should contain those three errors
    t.true(log.includes("'hello' is never reassigned. Use 'const' instead"));
    t.true(log.includes('Missing semicolon'));
    t.true(log.includes('Unexpected console statement'));

    t.end();
  });
});

test.cb('runs and takes care of autofixable errors', (t) => {
  const spy = sinon.spy(console, 'log');

  // read the contents of the to-be fixed file in its original state
  const untouchedFileContents = readFileSync(path.join(__dirname, './fixtures/main.js'), 'utf-8');
  // read the fixture file, containing the expected autofix result
  const fixtureFileContents = readFileSync(path.join(__dirname, './expected/main.js'), 'utf-8');

  task(defaults, {
    dev: true,
    fix: true,
  })().on('finish', () => {
    spy.restore();
    const log = utils.stripLogs(spy);

    // read the contents of the file that got autofixed by eslint
    const touchedFileContents = readFileSync(path.join(__dirname, './fixtures/main.js'), 'utf-8');
    // revert the autofixed file to its original state
    writeFileSync(path.join(__dirname, './fixtures/main.js'), untouchedFileContents);

    // the autofixed file should contain the same as the expected file
    t.true(touchedFileContents === fixtureFileContents);
    // should print out the unfixable error
    t.true(log.includes('Unexpected console statement'));
    // should not print out fixable errors, because eslint already took care of them
    t.false(log.includes("'hello' is never reassigned. Use 'const' instead"));
    t.false(log.includes('Missing semicolon'));

    t.end();
  });
});
