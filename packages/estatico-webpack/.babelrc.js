const env = require('yargs').argv;

module.exports = {
  presets: [
    // Docs: https://www.npmjs.com/package/@babel/preset-env
    ['@babel/preset-env', {
      // Include polyfills when needed
      useBuiltIns: 'usage',
      corejs: 3,

      // See browserslist file for config
      // targets: {},

      // Disabled due to https://gist.github.com/jasonphillips/57c1f8f9dbcd8b489dafcafde4fcdba6
      // loose: true,

      // Read log level passed to gulp-cli
      debug: (env.L && env.L.length > 3),
    }],
  ],
};
