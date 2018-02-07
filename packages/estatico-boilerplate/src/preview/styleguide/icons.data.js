const _ = require('lodash');
const defaultData = require('../../data/default.data.js');
const glob = require('glob');
const path = require('path');

const data = _.merge({}, defaultData, {
  meta: {
    title: 'Icons (font variant)',
  },
  icons: _.map(glob.sync('./source/{,demo/}{assets/media/,modules/**/}icons/*'), file => path.basename(file).replace(path.extname(file), '')),
  sizes: [16, 32, 48, 72],
  additionalLayoutClass: 'sg_icons',
});

module.exports = data;
