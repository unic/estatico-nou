const _ = require('lodash');
const defaultData = require('../../../data/default.data.js');
const skiplinksData = require('../../modules/skiplinks/skiplinks.data.js');
const slideshowData = require('../../modules/slideshow/slideshow.data.js');

const data = _.merge({}, defaultData, {
  meta: {
    title: 'Demo: 05 Custom module config',
  },
  props: {
    title: 'Custom module config',
    text: 'This page demonstrates the customized initialization of a module.',
    modules: {
      skiplinks: skiplinksData.props,
      slideshow: _.merge({}, slideshowData.props, {
        data: null,
        options: JSON.stringify({
          initialItem: 1,
        }),
      }),
    },
  },
});

module.exports = data;
