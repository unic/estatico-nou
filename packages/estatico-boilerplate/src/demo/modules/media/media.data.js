const _ = require('lodash');
const dataHelper = require('@unic/estatico-data');
const { handlebars } = require('@unic/estatico-handlebars');
const defaultData = require('../../../data/default.data.js');

const template = dataHelper.getFileContent('media.hbs');
const data = _.merge({}, defaultData, {
  meta: {
    title: 'Demo: Media demo',
    jira: 'JIRA-3',
  },
  props: {},
});

data.variants = dataHelper.setupVariants({
  data,
  template,
  handlebars,
  skipCode: true,
});

module.exports = data;
