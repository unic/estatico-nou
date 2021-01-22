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
    dependencyGraph: Joi.object().keys({
      srcBase: Joi.string().required(),
      resolver: Joi.object().required(),
    }),
    watcher: Joi.func(),
  }).with('dependencyGraph', 'watcher').allow(null),
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
  const nodeSassJsonImporter = require('node-sass-json-importer');
  const fs = require('fs');
  const path = require('path');

  const logger = new Logger('estatico-sass');

  return {
    src: null,
    srcBase: null,
    dest: null,
    watch: null,
    minifiedSuffix: '.min',
    plugins: {
      sass: {
        includePaths: null,
        importer: [
          nodeSassJsonImporter,

          // Resolve CSS files
          (url, file) => {
            if (!/\.css$/.test(url)) {
              return null;
            }

            let filePath = path.resolve(path.dirname(file), url);

            // Check parent node_modules (e.g. in monorepos)
            if (!fs.existsSync(filePath) && filePath.match(/(\/|\\)node_modules(\/|\\)/)) {
              filePath = require.resolve(filePath.replace(/(.*?)(\/|\\)node_modules(\/|\\)/, ''));
            }

            // Stop if file could not be found
            if (!fs.existsSync(filePath)) {
              logger.error({
                message: `Import "${url}" not found`,
                plugin: 'Custom CSS importer',
              }, env.dev);

              return null;
            }

            return {
              file: url,
              contents: fs.readFileSync(filePath, 'utf-8'),
            };
          },
        ],
      },
      clone: env.ci,
      postcss: [
        autoprefixer(),
      ].concat(env.dev ? [] : filterStream(['**/*', '!**/*.min*'], clean())),
    },
    logger,
  };
};

/**
 * Task function
 * @param {object} config - Complete task config
 * @param {object} env - Optional environment config, e.g. { dev: true }
 * @param {object} [watcher] - Watch file events (requires `@unic/estatico-watch`)
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
  const ignore = require('gulp-ignore');
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
      if (watcher && watcher.matchGraph && !watcher.matchGraph(file.path)) {
        return done();
      }

      return done(null, file);
    }))

    .pipe(sourcemaps.init())

    // Sass
    .pipe(sass(config.plugins.sass).on('error', err => config.logger.error(err, env.dev)))

    // Clone for production version
    .pipe(config.plugins.clone ? through.obj(function (file, enc, done) { // eslint-disable-line
      const clone = file.clone();

      clone.path = file.path.replace(path.extname(file.path), ext => `${config.minifiedSuffix}${ext}`);

      config.logger.debug(`Cloned ${chalk.yellow(file.path)} to ${chalk.yellow(clone.path)} to keep unminified files`);

      this.push(clone);

      done(null, file);
    }) : through.obj((file, enc, done) => {
      if (!env.dev) {
        file.path = file.path.replace(path.extname(file.path), ext => `${config.minifiedSuffix}${ext}`); // eslint-disable-line no-param-reassign
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

    // Save
    .pipe(gulp.dest(config.dest))

    // Remove sourcemaps before logging size
    .pipe(ignore.exclude(file => path.extname(file.path) === '.map'))

    // Log size
    .pipe(size({
      showFiles: true,
      title: 'estatico-sass',
    }));
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
