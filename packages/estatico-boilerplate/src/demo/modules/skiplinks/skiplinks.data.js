const _ = require('lodash');
const dataHelper = require('@unic/estatico-data');
const { handlebars } = require('@unic/estatico-handlebars');
const defaultData = require('../../../data/default.data.js');

const template = dataHelper.getFileContent('skiplinks.hbs');
const data = _.merge({}, defaultData, {
  meta: {
    title: 'Demo: Skiplinks',
    jira: 'JIRA-5',
  },
  props: {
    links: [
      {
        href: '#main',
        accesskey: 1,
        title: '[ALT + 1]',
        label: 'Skip to content',
      },
    ],
  },
});

data.variants = dataHelper.setupVariants({
  data,
  template,
  handlebars,
});

module.exports = data;
