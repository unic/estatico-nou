const parseArgs = require('minimist');

const env = parseArgs(process.argv.slice(2));
const data = {
  meta: {
    project: 'Estático',
  },
  env,
  props: {
    svgSprites: JSON.stringify([
      // Disabled since there are no icons by default
      // '/assets/media/svg/base.svg'
    ]),
  },
};

module.exports = data;
