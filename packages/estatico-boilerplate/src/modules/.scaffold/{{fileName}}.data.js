const _ = require('lodash');
const dataHelper = require('@unic/estatico-data');
const { handlebars } = require('@unic/estatico-handlebars');
const defaultData = require('../../data/default.data.js');

const template = dataHelper.getFileContent('{{fileName}}.hbs');
const data = _.merge({}, defaultData, {
  meta: {
    title: '{{name}}',
    className: '{{className}}',
    jira: 'ESTATICO-*',
    documentation: dataHelper.getDocumentation('{{fileName}}.md'),
  },
  props: {

  },
});
const variants = {
  default: {},
  otherVariant: {
    meta: {
      title: 'Variant title',
      desc: 'Variant description',
    },
    props: {

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
