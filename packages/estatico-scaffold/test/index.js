const test = require('ava');
const utils = require('@unic/estatico-utils').test;
const path = require('path');
const del = require('del');
const task = require('../index.js');

const defaults = {
  types: [
    {
      name: 'test',
      src: './test/fixtures/scaffold/*',
      dest: './test/results/',
    },
  ],
  answers: {
    type: 'test',
    action: 'Add',
    name: 'Yay',
    fileName: 'yay',
    files: './test/fixtures/scaffold/*',
  },
};

test.afterEach.always(() => del(path.join(__dirname, '/results')));

test('default', t => new Promise((resolve) => {
  task(defaults)()
    .then(() => {
      const pairsMatch = utils.compareFiles(path.join(__dirname, 'expected/default/*'));
      resolve(t.truthy(pairsMatch));
    });
}));
