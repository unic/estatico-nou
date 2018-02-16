const parseArgs = require('minimist');

const env = parseArgs(process.argv.slice(2));
const data = {
  meta: {
    project: 'Estático',
  },
  env,
  props: {
    svgSprites: JSON.stringify([
      '/assets/media/svgsprite/base.svg',
      '/assets/media/svgsprite/demo.svg',
    ]),
  },
};

module.exports = data;
