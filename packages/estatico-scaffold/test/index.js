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

test.cb('default', (t) => {
  task(defaults)().then((/* results */) => {
    // console.log(results);

    utils.compareFiles(t, path.join(__dirname, 'expected/default/*'));
  });
});

test.afterEach(() => del(path.join(__dirname, '/results')));
