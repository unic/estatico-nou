/* eslint-disable global-require */
const { Plugin, Logger } = require('@unic/estatico-utils');
const Joi = require('joi');

// Config schema used for validation
const schema = Joi.object().keys({
  src: [Joi.string().required(), Joi.array().required()],
  srcBase: Joi.string().required(),
  dest: Joi.string().required(),
  minifiedSuffix: Joi.string().required(),
  plugins: {
    sass: Joi.object().keys({
      includePaths: Joi.array().allow(null),
      importer: Joi.array(),
    }),
    postcss: Joi.array(),
  },
  watch: Joi.object().keys({
    src: [Joi.string().required(), Joi.array().required()],
    name: Joi.string().required(),
  }).allow(null),
  logger: Joi.object().keys({
    info: Joi.func(),
    error: Joi.func(),
    debug: Joi.func(),
  }),
});

/**
 * Default config
 * @param {object} env - Optional environment config, e.g. { dev: true }
 * @return {object}
 */
const defaults = (env = {}) => {
  const autoprefixer = require('autoprefixer');
  const clean = require('postcss-clean');
  const filterStream = require('postcss-filter-stream');

  return {
    src: null,
    srcBase: null,
    dest: null,
    watch: null,
    minifiedSuffix: '.min',
    plugins: {
      sass: {
        includePaths: null,
      },
      clone: !env.dev,
      postcss: [
        autoprefixer({
          browsers: ['last 1 version'],
        }),
      ].concat(env.dev ? [] : filterStream(['**/*', '!**/*.min*'], clean())),
    },
    logger: new Logger('estatico-sass'),
  };
};

/**
 * Task function
 * @param {object} config - Complete task config
 * @param {object} env - Optional environment config, e.g. { dev: true }
 * @param {object} [watcher] - Watch file events
 * @return {object} gulp stream
 */
const task = (config, env = {}, watcher) => {
  const chalk = require('chalk');
  const path = require('path');
  const gulp = require('gulp');
  const plumber = require('gulp-plumber');
  const sass = require('gulp-sass');
  const postcss = require('gulp-postcss');
  const sourcemaps = require('gulp-sourcemaps');
  const through = require('through2');
  const size = require('gulp-size');

  const autoprefixer = config.plugins.postcss.find(plugin => plugin.postcssPlugin === 'autoprefixer');

  if (autoprefixer) {
    const info = autoprefixer.info();

    config.logger.debug('autoprefixer', info);
  }

  return gulp.src(config.src, {
    base: config.srcBase,
  })

    // Prevent stream from unpiping on error
    .pipe(plumber())

    // Decide based on watcher dependency graph which files to pass through
    .pipe(through.obj((file, enc, done) => {
      if (watcher && watcher.resolvedGraph) {
        config.logger.debug('watcher', 'Resolved watch graph:', watcher.resolvedGraph);

        if (!watcher.resolvedGraph.includes(file.path)) {
          config.logger.debug('watcher', `${chalk.yellow(file.path)} not found in resolved graph. It will not be rebuilt.`);

          return done();
        }
      }

      return done(null, file);
    }))

    .pipe(sourcemaps.init())

    // Sass
    .pipe(sass(config.plugins.sass).on('error', err => config.logger.error(err, env.dev)))

    // Clone for production version
    .pipe(through.obj(function (file, enc, done) { // eslint-disable-line
      if (config.plugins.clone) {
        const clone = file.clone();

        clone.path = file.path.replace(path.extname(file.path), ext => `${config.minifiedSuffix}${ext}`);

        config.logger.debug('clone', `Cloned ${chalk.yellow(file.path)} to ${chalk.yellow(clone.path)}`);

        this.push(clone);
      }

      done(null, file);
    }))

    // PostCSS
    .pipe(postcss(config.plugins.postcss))

    // Add sourcemaps files to stream
    .pipe(sourcemaps.write('.', {
      includeContent: false,
      sourceRoot: config.srcBase,
    }))

    // Log size
    .pipe(size({
      showFiles: true,
      title: 'estatico-sass',
    }))

    // Save
    .pipe(gulp.dest(config.dest));
};

/**
 * @param {object|func} options - Custom config
 *  Either deep-merged (object) or called (func) with defaults
 * @param {object} env - Optional environment config, e.g. { dev: true }, passed to defaults
 * @return {func} Task function from above with bound config and env
 */
module.exports = (options, env = {}) => new Plugin({
  defaults,
  schema,
  options,
  task,
  env,
});
