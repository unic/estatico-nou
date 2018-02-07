const _ = require('lodash');
const defaultData = require('../../../data/default.data.js');
const skiplinksData = require('../../modules/skiplinks/skiplinks.data.js');

const data = _.merge({}, defaultData, {
  meta: {
    title: 'Demo: 03 Sublayout',
  },
  props: {
    title: 'Sublayout',
    text: 'This page demonstrates how to extend a sublayout.',
    sidebar: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.',
    modules: {
      skiplinks: skiplinksData.props,
    },
  },
});

module.exports = data;
