const _ = require('lodash');
const defaultData = require('../../../data/default.data.js');
const skiplinksData = require('../../modules/skiplinks/skiplinks.data.js');

const data = _.merge({}, defaultData, {
  meta: {
    title: 'Demo: 02 Page (custom teasers)',
  },
  props: {
    title: 'Page (custom teasers)',
    text: 'This page demonstrates the inclusion of a module with custom data.',
    modules: {
      skiplinks: skiplinksData.props,
      teasers: {
        teasers: _.map(['Custom Teaser 1', 'Custom Teaser 2', 'Custom Teaser 3'], value => ({
          title: value,
          text: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.',
        })),
      },
    },
  },
});

module.exports = data;
