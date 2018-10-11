const _ = require('lodash');
const dataHelper = require('@unic/estatico-data');
const { handlebars } = require('@unic/estatico-handlebars');
const defaultData = require('../../../data/default.data.js');
const teaserData = require('../teaser/teaser.data.js').props;

const template = dataHelper.getFileContent('teasers.hbs');
const data = _.merge({}, defaultData, {
  meta: {
    title: 'Demo: Teasers',
    jira: 'JIRA-1',
    feature: 'Feature X',
    schema: require.resolve('./teasers.schema.json'),
  },
  props: {
    teasers: _.map(['Teaser 1', 'Teaser 2', 'Teaser 3', 'Teaser 4'], value => _.merge({}, teaserData, {
      title: value,
    })),
  },
});

data.variants = dataHelper.setupVariants({
  data,
  template,
  handlebars,
});

module.exports = data;
