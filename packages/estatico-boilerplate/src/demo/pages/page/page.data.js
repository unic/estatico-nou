const _ = require('lodash');
const defaultData = require('../../../data/default.data.js');
const skiplinksData = require('../../modules/skiplinks/skiplinks.data.js');
const teasersData = require('../../modules/teasers/teasers.data.js');

const data = _.merge({}, defaultData, {
  meta: {
    title: 'Demo: 01 Page',
  },
  props: {
    title: 'Page',
    text: 'This page demonstrates the inclusion of a module.',
    modules: {
      skiplinks: skiplinksData.props,
      teasers: teasersData.props,
    },
  },
});

module.exports = data;
