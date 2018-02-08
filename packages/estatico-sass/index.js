/* eslint-disable global-require */
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
    autoprefixer: Joi.object().keys({
      browsers: Joi.array().default(['last 1 version']),
    }).allow(null),
    clean: Joi.object().allow(null),
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
const defaults = (env = {}) => ({
  src: null,
  srcBase: null,
  dest: null,
  watch: null,
  minifiedSuffix: '.min',
  plugins: {
    sass: {
      includePaths: null,
    },
    autoprefixer: {
      browsers: ['last 1 version'],
    },
    clean: env.dev ? null : {},
  },
  logger: new require('@unic/estatico-utils').Logger('estatico-sass'), // eslint-disable-line
});

/**
 * Task function
 * @param {object} config - Complete task config
 * @param {object} env - Optional environment config, e.g. { dev: true }
 * @return {object} gulp stream
 */
const task = (config, env = {}) => {
  const chalk = require('chalk');
  const path = require('path');
  const gulp = require('gulp');
  const plumber = require('gulp-plumber');
  const sass = require('gulp-sass');
  const postcss = require('gulp-postcss');
  const autoprefixer = require('autoprefixer');
  const clean = require('postcss-clean');
  const sourcemaps = require('gulp-sourcemaps');
  const through = require('through2');
  const size = require('gulp-size');
  const filterStream = require('postcss-filter-stream');

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
    .pipe(sass(config.plugins.sass).on('error', err => config.logger.error(err, env.dev)))

    // Clone for production version
    .pipe(through.obj(function (file, enc, done) { // eslint-disable-line
      if (config.plugins.clean) {
        const clone = file.clone();

        clone.path = file.path.replace(path.extname(file.path), ext => `${config.minifiedSuffix}${ext}`);

        config.logger.debug('clone', `Cloned ${chalk.yellow(file.path)} to ${chalk.yellow(clone.path)}`);

        this.push(clone);
      }

      done(null, file);
    }))

    // PostCSS
    .pipe(postcss([]
      .concat(config.plugins.autoprefixer ? autoprefixer(config.plugins.autoprefixer) : [])
      .concat(config.plugins.clean ? filterStream(['**/*', `!**/*${config.minifiedSuffix}*`], clean(config.plugins.clean)) : [])))

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
module.exports = (options, env = {}) => {
  const merge = require('lodash.merge');
  const watcher = require('@unic/estatico-watch');

  let config = {};

  // Either merge or transform options
  if (typeof options === 'function') {
    config = options(defaults(env));
  } else {
    config = merge({}, defaults(env), options);
  }

  // Validate options
  const validate = Joi.validate(config, schema, {
    allowUnknown: true,
  });

  if (validate.error) {
    config.logger.error(new Error(`Config validation: ${validate.error}`), env.dev);
  }

  // Add optional watcher
  if (env.watch && config.watch) {
    const watchConfig = merge({}, {
      task: task.bind(null, config, env),
    }, config.watch);

    watcher(watchConfig)();
  }

  // Return configured task function
  return task.bind(null, config, env);
};
