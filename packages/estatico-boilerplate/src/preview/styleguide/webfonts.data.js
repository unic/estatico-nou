const _ = require('lodash');
const defaultData = require('../../data/default.data.js');

const data = _.merge({}, defaultData, {
  meta: {
    title: 'Webfonts',
  },
  fonts: [{
    family: 'Roboto',
    variants: [
      {
        weight: 400,
        style: 'normal',
      },
      {
        weight: 400,
        style: 'italic',
      },
      {
        weight: 700,
        style: 'normal',
      },
      {
        weight: 700,
        style: 'italic',
      },
    ],
  }],
  additionalLayoutClass: 'sg_fonts',
});

module.exports = data;
