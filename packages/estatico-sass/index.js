const chalk = require('chalk');
const merge = require('lodash.merge');
const path = require('path');
const { Logger } = require('estatico-utils');

const logger = new Logger('estatico-sass');

const defaults = dev => ({
  src: null,
  srcBase: null,
  srcIncludes: [],
  dest: null,
  plugins: {
    sass: {
      includePaths: null,
    },
    autoprefixer: {
      browsers: ['last 1 version'],
    },
    clean: dev ? null : {},
    rename: dev ? null : file => file.path.replace(path.extname(file.path), ext => `.min${ext}`),
  },
  logger,
});

module.exports = (options, dev) => {
  let config = {};

  if (typeof options === 'function') {
    config = options(defaults(dev));
  } else {
    config = merge({}, defaults(dev), options);
  }

  // Validate options
  if (!config.src) {
    throw new Error('\'options.src\' is missing');
  }
  if (!config.srcBase) {
    throw new Error('\'options.srcBase\' is missing');
  }
  if (!config.dest) {
    throw new Error('\'options.dest\' is missing');
  }

  return () => {
    const gulp = require('gulp'); // eslint-disable-line global-require
    const plumber = require('gulp-plumber'); // eslint-disable-line global-require
    const sass = require('gulp-sass'); // eslint-disable-line global-require
    const postcss = require('gulp-postcss'); // eslint-disable-line global-require
    const autoprefixer = require('autoprefixer'); // eslint-disable-line global-require
    const clean = require('postcss-clean'); // eslint-disable-line global-require
    const sourcemaps = require('gulp-sourcemaps'); // eslint-disable-line global-require
    const through = require('through2'); // eslint-disable-line global-require
    const size = require('gulp-size'); // eslint-disable-line global-require

    if (config.plugins.autoprefixer) {
      const info = autoprefixer(config.plugins.autoprefixer).info();

      config.logger.debug('autoprefixer', info);
    }

    return gulp.src(config.src, {
      base: config.srcBase,
    })

      // Prevent stream from unpiping on error
      .pipe(plumber())

      // TODO: Add dependency graph and decide based on fileEvents which files to pass through
      // .pipe(through.obj((file, enc, done) => {
      //   done(null, file)
      // }))

      .pipe(sourcemaps.init())

      // Sass
      .pipe(sass(config.plugins.sass).on('error', err => config.logger.error(err, dev)))

      // PostCSS
      .pipe(postcss([]
        .concat(config.plugins.autoprefixer ? autoprefixer(config.plugins.autoprefixer) : [])
        .concat(config.plugins.clean ? clean(config.plugins.clean) : [])))

      // Optional rename, allows to add .min prefix, e.g.
      .pipe(through.obj((file, enc, done) => {
        if (config.plugins.rename) {
          const filePath = config.plugins.rename(file);

          file.path = filePath; // eslint-disable-line no-param-reassign

          config.logger.debug('rename', `Rename ${chalk.yellow(file.path)} to ${chalk.yellow(filePath)}`);
        }

        done(null, file);
      }))

      .pipe(sourcemaps.write('.', {
        includeContent: false,
        sourceRoot: config.srcBase,
      }))

      // Log
      .pipe(size({
        showFiles: true,
      }))

      // Save
      .pipe(gulp.dest(config.dest));
  };
};
