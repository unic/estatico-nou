const test = require('ava');
const sinon = require('sinon');
const utils = require('@unic/estatico-utils').test;
const merge = require('lodash.merge');
const task = require('../index.js');

const defaults = {
  srcBase: './test/fixtures',
};

test.cb('default', (t) => {
  const spy = sinon.spy(process.stdout, 'write');
  const options = merge({}, defaults, {
    src: ['./test/fixtures/default/*.js'],
    plugins: {
      setup: {
        getData: content => content,
        getSchemaPath: () => require.resolve('./fixtures/default/schema.json'),
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
  const spy = sinon.spy(process.stdout, 'write');
  const options = merge({}, defaults, {
    src: ['./test/fixtures/variants/*.js'],
    plugins: {
      setup: {
        getSchemaPath: () => require.resolve('./fixtures/variants/schema.json'),
      },
    },
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

test.cb('refs', (t) => {
  const spy = sinon.spy(process.stdout, 'write');
  const options = merge({}, defaults, {
    src: ['./test/fixtures/refs/*.js'],
    plugins: {
      setup: {
        getSchemaPath: () => require.resolve('./fixtures/refs/schema.json'),
      },
    },
  });

  task(options, {
    dev: true,
  })().on('finish', () => {
    spy.restore();

    const log = utils.stripLogs(spy);

    // error.js should log an error
    t.regex(log, /refs\/error\.js #\/properties\/items\/items\/properties\/age\/type: should be integer/);

    // // success.js should not log any errors
    t.notRegex(log, /refs\/success\.js/);

    t.end();
  });
});
