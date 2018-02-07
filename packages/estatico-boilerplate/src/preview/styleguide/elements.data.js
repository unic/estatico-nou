const _ = require('lodash');
const defaultData = require('../../data/default.data.js');

const data = _.merge({}, defaultData, {
  meta: {
    title: 'Elements',
  },
  additionalLayoutClass: 'sg_elements',
});

module.exports = data;
