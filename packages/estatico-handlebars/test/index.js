const test = require('ava');
const sinon = require('sinon');
const utils = require('@unic/estatico-utils').test;
const path = require('path');
const del = require('del');
const merge = require('lodash.merge');
const task = require('../index.js');

const defaults = {
  src: './test/fixtures/index.hbs',
  srcBase: './test/fixtures/',
  dest: './test/results/',
  plugins: {
    data: file => require(file.path.replace(path.extname(file.path), '.json')), // eslint-disable-line global-require, import/no-dynamic-require
    handlebars: {
      partials: './test/fixtures/_*.hbs',
    },
    prettify: {
      // Use tabs over spaces
      indent_with_tabs: true,
    },
    clone: null,
  },
};

test.cb('default', (t) => {
  task(defaults)().on('finish', () => utils.compareFiles(t, path.join(__dirname, 'expected/default/*')));
});

test.cb('unprettified', (t) => {
  const options = merge({}, defaults, {
    plugins: {
      prettify: null,
    },
  });

  task(options)().on('finish', () => utils.compareFiles(t, path.join(__dirname, 'expected/unprettified/*')));
});

test.cb('customHelpers', (t) => {
  const options = merge({}, defaults, {
    src: './test/fixtures/helper.hbs',
    plugins: {
      handlebars: {
        helpers: {
          link: object => `<a href="${object.url}">${object.text}</a>`,
        },
      },
    },
  });

  task(options)().on('finish', () => utils.compareFiles(t, path.join(__dirname, 'expected/customHelpers/*')));
});

test.cb('customHelpersFactory', (t) => {
  const options = merge({}, defaults, {
    src: './test/fixtures/helper.hbs',
    plugins: {
      handlebars: {
        helpers: {
          register: (handlebars) => {
            handlebars.registerHelper('link', (object) => { // eslint-disable-line arrow-body-style
              return new handlebars.SafeString(`<a href="${object.url}">${object.text}</a>`);
            });
          },
        },
      },
    },
  });

  task(options)().on('finish', () => utils.compareFiles(t, path.join(__dirname, 'expected/customHelpers/*')));
});

test.cb('error', (t) => {
  const options = merge({}, defaults, {
    src: './test/fixtures/error.hbs',
  });

  const spy = sinon.spy(console, 'log');

  task(options, {
    dev: true,
  })().on('finish', () => {
    spy.restore();

    const log = utils.stripLogs(spy);

    t.regex(log, /test\/fixtures\/error.json: Unexpected token in JSON at position 15/);
    t.regex(log, /test\/fixtures\/error.hbs Parse error on line 2/);

    t.end();
  });
});

test.afterEach(() => del(path.join(__dirname, '/results')));
