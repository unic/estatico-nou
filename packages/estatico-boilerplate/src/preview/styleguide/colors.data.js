const _ = require('lodash');
const dataHelper = require('@unic/estatico-data');
const defaultData = require('../../data/default.data.js');

const data = _.merge({}, defaultData, {
  meta: {
    title: 'Colors',
  },
  colors: dataHelper.getColors('../../assets/css/data/colors.json'),
  additionalLayoutClass: 'sg_colors',
});

module.exports = data;
