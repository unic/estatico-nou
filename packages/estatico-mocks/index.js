const gulp = require('gulp');
const tap = require('gulp-tap');
const rename = require('gulp-rename');
const prettify = require('gulp-prettify');
const path = require('path');
const through = require('through2');
const log = require('fancy-log');
const PluginError = require('plugin-error');
const chalk = require('chalk');
const importFresh = require('import-fresh');
const merge = require('lodash.merge');

const defaults = {
  src: [
    './src/*.data.js',
    './src/pages/**/*.data.js',
    './src/demo/pages/**/*.data.js',
    './src/modules/**/*.data.js',
    './src/demo/modules/**/*.data.js',
  ],
  srcBase: './src',
  plugins: {
    data: file => importFresh(file.path.replace(path.extname(file.path), '.data.js')),
    prettify: {
      indent_with_tabs: false,
      max_preserve_newlines: 1,
    },
  },
  errorHandler: (err) => {
    log(`estatico-mocks${err.plugin ? ` (${err.plugin})` : null}`, chalk.cyan(err.fileName), chalk.red(err.message));
  },
  dest: './dist/',
  watch: [
    './src/*.(hbs|data.js|md)',
    './src/pages/**/*.(hbs|data.js|md)',
    './src/demo/pages/**/*.(hbs|data.js|md)',
    './src/modules/**/!(_)*.(hbs|data.js|md)',
    './src/demo/modules/**/!(_)*.(hbs|data.js|md)',
    './src/preview/styleguide/*.(hbs|data.js|md)',
  ],
};

module.exports = (options) => {
  const config = merge({}, defaults, options);

  return gulp.src(config.src, {
    base: config.srcBase,
    read: false,
  })

    .pipe(tap(function(file) {
      var data = require(file.path);

      file.contents = new Buffer(JSON.stringify(data));
    }))

    .pipe(rename(function(path) {
			path.basename = path.basename.replace('.data', '');
			path.extname = '.json';
		}))

    // Formatting
    .pipe(config.plugins.prettify ? prettify(config.plugins.prettify) : through.obj())

    // Rename to .html
    .pipe(through.obj((file, enc, done) => {
      file.path = file.path.replace('.data', ''); // eslint-disable-line no-param-reassign
      file.path.extname = '.json';

      done(null, file);
    }))

    // Save
    .pipe(gulp.dest(config.dest));
};
