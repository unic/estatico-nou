const _ = require('lodash');
const defaultData = require('../../../data/default.data.js');
const skiplinksData = require('../../modules/skiplinks/skiplinks.data.js');
const slideshowData = require('../../modules/slideshow/slideshow.data.js');

const data = _.merge({}, defaultData, {
  meta: {
    title: 'Demo: 04 Handlebars helpers',
  },
  props: {
    title: 'Handlebars helpers',
    text: 'This page demonstrates the use of a some handlebars helpers (see helpers/handlebars.js).',
    warning: 'WARNING: Use them with caution, they currently won\'t work on the client-side when precompiling templates.',
    partial: 'demo/modules/slideshow/slideshow',
    partialPlaceholder: 'slideshow',
    partials: [
      {
        placeholder: 'slideshow',
      },
    ],
    testString: 'hello world',
    subString: 'hello',
    testString2: 'hello world',
    modules: {
      skiplinks: skiplinksData.props,
      slideshow: slideshowData.props,
    },
  },
});

module.exports = data;
