const _ = require('lodash');
const dataHelper = require('@unic/estatico-data');
const defaultData = require('./data/default.data.js');
const path = require('path');

const transform = (originalData, filePath) => {
  const previewUrl = path.relative('./src/', filePath).replace('.data.js', '.html');

  const data = _.merge({}, originalData, {
    meta: {
      previewUrl,
    },
  });

  return data;
};

const data = _.merge({}, defaultData, {
  pages: dataHelper.getDataGlob('./src/pages/**/*.data.js', transform),
  demoPages: dataHelper.getDataGlob('./src/demo/pages/**/*.data.js', transform),
  modules: dataHelper.getDataGlob('./src/modules/**/*.data.js', transform),
  demoModules: dataHelper.getDataGlob('./src/demo/modules/**/*.data.js', transform),
  styleguide: dataHelper.getDataGlob('./src/preview/styleguide/*.data.js', transform),
});

data.pages = _.sortBy(data.pages, item => item.meta.title)
  .concat(_.sortBy(data.demoPages, item => item.meta.title));

data.modules = _.sortBy(data.modules, item => item.meta.title)
  .concat(_.sortBy(data.demoModules, item => item.meta.title));

data.styleguide = _.sortBy(data.styleguide, item => item.meta.title);

module.exports = data;
