const _ = require('lodash');
const dataHelper = require('@unic/estatico-data');
const { handlebars } = require('@unic/estatico-handlebars');
const defaultData = require('../../../data/default.data.js');

const template = dataHelper.getFileContent('teaser.hbs');
const data = _.merge({}, defaultData, {
  meta: {
    title: 'Demo: Teaser with module variants',
    schema: require.resolve('./teaser.schema.json'),
  },
  props: {
    title: 'Teaser title',
    text: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.',
  },
});
const variants = {
  default: {},
  noText: {
    meta: {
      title: 'No text',
      desc: 'Used when there are no words.',
    },
    props: {
      title: 'Teaser title',
      text: null,
    },
  },
  inverted: {
    meta: {
      title: 'Inverted',
      desc: 'Used at night. Set `variant` to `m-teaser--inverted`.',
    },
    props: {
      title: 'Teaser title',
      text: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.',
      variant: 'm-teaser--inverted',
    },
  },
};

data.variants = dataHelper.setupVariants({
  variants,
  data,
  template,
  handlebars,
});

module.exports = data;
