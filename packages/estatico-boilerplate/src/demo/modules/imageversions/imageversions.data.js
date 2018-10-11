const _ = require('lodash');
const dataHelper = require('@unic/estatico-data');
const { handlebars } = require('@unic/estatico-handlebars');
const defaultData = require('../../../data/default.data.js');

const template = dataHelper.getFileContent('imageversions.hbs');
const data = _.merge({}, defaultData, {
  meta: {
    title: 'Demo: Image versions',
    documentation: dataHelper.getDocumentation('imageversions.md'),
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
