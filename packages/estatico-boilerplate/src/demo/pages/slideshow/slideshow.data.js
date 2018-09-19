const _ = require('lodash');
const defaultData = require('../../../data/default.data.js');
const skiplinksData = require('../../modules/skiplinks/skiplinks.data.js');
const slideshowData = require('../../modules/slideshow/slideshow.data.js');

const data = _.merge({}, defaultData, {
  meta: {
    title: 'Demo: 05 Unit test on page',
  },
  props: {
    title: 'Unit test',
    text: 'This page demonstrates the customized initialization of a module and allows to run its JavaScript unit tests.',
    modules: {
      skiplinks: skiplinksData.props,
      slideshow: slideshowData.props,
    },
  },
});

module.exports = data;
