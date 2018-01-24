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

test.afterEach(() => del(path.join(__dirname, '/results')));
