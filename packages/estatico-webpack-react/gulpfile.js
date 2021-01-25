/* eslint-disable global-require */
const gulp = require('gulp');
const env = require('minimist')(process.argv.slice(2));

gulp.task('js', (cb) => {
  const task = require('@unic/estatico-webpack');
  const webpackConfig = require('./webpack.config.js');

  const instance = task(defaults => ({
    webpack: webpackConfig,
    logger: defaults.logger,
  }), env);

  return instance(cb);
});

/**
 * Serve task
 * Uses Browsersync to serve the build directory, reloads on changes
 */
gulp.task('serve', () => {
  const task = require('@unic/estatico-browsersync');

  const instance = task({
    plugins: {
      browsersync: {
        server: './dist',
        watch: './dist/**/*.{html,css,js}',
      },
    },
  }, env);

  return instance();
});
