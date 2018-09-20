const test = require('ava');
const sinon = require('sinon');
const utils = require('@unic/estatico-utils').test;
const path = require('path');
const merge = require('lodash.merge');
const task = require('../index.js');

const defaults = {
  srcBase: './test/fixtures',
  plugins: {
    input: {
      getSchemaPath: filePath => filePath.replace(path.basename(filePath), 'schema.json'),
    },
  },
};

test.cb('default', (t) => {
  const spy = sinon.spy(console, 'log');
  const options = merge({}, defaults, {
    src: ['./test/fixtures/default/*.js'],
    plugins: {
      input: {
        getData: data => data,
      },
    },
  });

  task(options, {
    dev: true,
  })().on('finish', () => {
    spy.restore();

    const log = utils.stripLogs(spy);

    // error.js should log two errors
    t.regex(log, /default\/error\.js #\/required: should have required property 'firstName'/);
    t.regex(log, /default\/error\.js #\/properties\/age\/type: should be integer/);

    // success.js should not log any errors
    t.notRegex(log, /default\/success\.js/);

    t.end();
  });
});

test.cb('variants', (t) => {
  const spy = sinon.spy(console, 'log');
  const options = merge({}, defaults, {
    src: ['./test/fixtures/variants/*.js'],
  });

  task(options, {
    dev: true,
  })().on('finish', () => {
    spy.restore();

    const log = utils.stripLogs(spy);

    // error.js should log two errors
    t.regex(log, /variants\/error\.js \[Default\] #\/required: should have required property 'firstName'/);
    t.regex(log, /variants\/error\.js \[Variant 1\] #\/properties\/age\/type: should be integer/);

    // success.js should not log any errors
    t.notRegex(log, /variants\/success\.js/);

    t.end();
  });
});
