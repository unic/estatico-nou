const merge = require('lodash.merge');
const { Logger } = require('@unic/estatico-utils');

const logger = new Logger('estatico-svgsprite');

const defaults = (/* dev */) => ({
  src: null,
  srcBase: null,
  dest: null,
  plugins: {
    svgstore: {
      inlineSvg: true,
    },
    imagemin: {
      svgoPlugins: [
        {
          cleanupIDs: {
            remove: false,
          },
        },
        {
          cleanupNumericValues: {
            floatPrecision: 2,
          },
        },
        {
          removeStyleElement: true,
        },
        {
          removeTitle: true,
        },
      ],
      multipass: true,
    },
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
    const svgstore = require('gulp-svgstore'); // eslint-disable-line global-require
    const imagemin = require('gulp-imagemin'); // eslint-disable-line global-require
    const mergeStream = require('merge-stream'); // eslint-disable-line global-require
    const through = require('through2'); // eslint-disable-line global-require
    const size = require('gulp-size'); // eslint-disable-line global-require
    const chalk = require('chalk'); // eslint-disable-line global-require
    const path = require('path'); // eslint-disable-line global-require

    const sprites = Object.keys(config.src).map(spriteName => gulp.src(config.src[spriteName], {
      base: config.srcBase,
    })

      // Prevent stream from unpiping on error
      .pipe(plumber())

      // Imagemin
      .pipe(config.plugins.imagemin ? imagemin(config.plugins.imagemin).on('error', err => config.logger.error(err, dev)) : through.obj())

      // Svgstore
      .pipe(svgstore(config.plugins.svgstore).on('error', err => config.logger.error(err, dev)))

      // Rename
      .pipe(through.obj((file, enc, done) => {
        const filePath = file.path
          .replace(path.basename(file.path, path.extname(file.path)), spriteName);

        file.path = filePath; // eslint-disable-line no-param-reassign

        config.logger.info(`Generated ${chalk.yellow(path.resolve(config.dest, file.path))}`);

        done(null, file);
      }))

      // Log
      .pipe(size({
        showFiles: true,
      }))

      // Save
      .pipe(gulp.dest(config.dest)));

    if (sprites.length > 0) {
      return mergeStream(sprites);
    }

    return sprites;
  };
};
