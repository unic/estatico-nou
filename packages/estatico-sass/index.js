const gulp = require('gulp');
const plumber = require('gulp-plumber');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const clean = require('postcss-clean');
const sourcemaps = require('gulp-sourcemaps');
const log = require('fancy-log');
const chalk = require('chalk');
const merge = require('lodash.merge');

const defaults = {
  src: null,
  srcBase: null,
  srcIncludes: [],
  dest: null,
  plugins: {
    sass: {
      includePaths: config => config.srcIncludes,
    },
    autoprefixer: {
      browsers: ['last 1 version'],
    },
    clean: {

    },
  },
  errorHandler: (err) => {
    log(`estatico-sass${err.plugin ? ` (${err.plugin})` : null}`, chalk.cyan(err.fileName), chalk.red(err.message));
  },
};

module.exports = (options) => {
  const config = merge({}, defaults, options);

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

  // Transform options
  config.plugins.sass.includePaths = config.plugins.sass.includePaths(config);

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
    .pipe(sass(config.plugins.sass).on('error', config.errorHandler))

    // PostCSS
    .pipe(postcss([]
      .concat(config.plugins.autoprefixer ? autoprefixer(config.plugins.autoprefixer) : [])
      .concat(config.plugins.clean ? clean(config.plugins.clean) : [])))

    .pipe(sourcemaps.write('.', {
      includeContent: false,
      sourceRoot: config.srcBase,
    }))

    // Save
    .pipe(gulp.dest(config.dest));
};
