const _ = require('lodash');
const defaultData = require('../../data/default.data.js');

const data = _.merge({}, defaultData, {
  meta: {
    title: 'Form Elements',
  },
  additionalLayoutClass: 'sg_forms',
});

module.exports = data;
