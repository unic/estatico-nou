const _ = require('lodash');
const glob = require('glob');
const path = require('path');
// const spriteTask = require('../../../../gulp/media/svgsprite.js');
const dataHelper = require('@unic/estatico-data');
const { handlebars } = require('@unic/estatico-handlebars');
const defaultData = require('../../../data/default.data.js');

const template = dataHelper.getFileContent('svgsprite.hbs');
const sprites = _.mapValues({
  base: ['./src/assets/media/svg/**/*.svg'],
  demo: ['./src/demo/modules/svgsprite/svg/*.svg'],
}, (globs) => {
  let files = [];

  globs.forEach((item) => {
    let paths = glob.sync(item);

    paths = paths.map(file => path.basename(file, path.extname(file)));

    files = files.concat(paths);
  });

  return files;
});
const data = _.merge({}, defaultData, {
  meta: {
    title: 'Demo: SVG icons',
    jira: 'ESTATICO-212',
    documentation: dataHelper.getDocumentation('svgsprite.md'),
  },
  props: {
    svgSprites: JSON.stringify(JSON.parse(defaultData.props.svgSprites || '[]').concat([
      '/assets/media/svgsprite/demo.svg',
    ])),
    preview: sprites,
  },
});

data.variants = dataHelper.setupVariants({
  data,
  template,
  handlebars,
  skipCode: true,
});

module.exports = data;
