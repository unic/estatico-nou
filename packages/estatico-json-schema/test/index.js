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
      getData: data => data,
      getSchemaPath: filePath => filePath.replace(path.basename(filePath), 'schema.json'),
    },
  },
};

test.cb('error', (t) => {
  const spy = sinon.spy(console, 'log');
  const options = merge({}, defaults, {
    src: './test/fixtures/default/error.js',
  });

  task(options, {
    dev: true,
  })().on('finish', () => {
    spy.restore();

    const log = utils.stripLogs(spy);

    t.notRegex(log, /default\/data.js should have required property \\'firstName\\'/);

    t.end();
  });
});

test.cb('success', (t) => {
  const spy = sinon.spy(console, 'log');
  const options = merge({}, defaults, {
    src: './test/fixtures/default/success.js',
  });

  task(options, {
    dev: true,
  })().on('finish', () => {
    spy.restore();

    const log = utils.stripLogs(spy);

    t.is(log, '');

    t.end();
  });
});
