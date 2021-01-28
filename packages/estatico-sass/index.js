const { Transform } = require('stream');
const { Plugin, Logger } = require('@unic/estatico-utils');
const Joi = require('joi');

const gulp = require('gulp');
const plumber = require('gulp-plumber');
const sass = require('gulp-sass');
const conditionally = require('gulp-if');
const postcss = require('gulp-postcss');
const presetEnv = require('postcss-preset-env');
const cssnano = require('cssnano');
const rename = require('gulp-rename');
const filter = require('gulp-filter');
const size = require('gulp-size');

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
const defaults = () => ({
  src: null,
  srcBase: null,
  dest: null,
  watch: null,
  plugins: {
    sass: {
      includePaths: null,
    },
    postcss: [
      presetEnv(),
    ],
  },
  logger: new Logger('estatico-sass'),
});

/**
 * Task function
 * @param {object} config - Complete task config
 * @param {object} env - Optional environment config, e.g. { dev: true }
 * @param {object} [watcher] - Watch file events (requires `@unic/estatico-watch`)
 * @return {object} gulp stream
 */
const task = (config, env = {}, watcher) => gulp.src(config.src, {
  base: config.srcBase,
  sourcemaps: env.dev,
})
  .pipe(plumber())
  // check whether the current file can be skipped
  .pipe((() => new Transform({
    objectMode: true,
    transform(file, _encoding, done) {
      if (watcher && watcher.matchGraph && !watcher.matchGraph(file.path)) {
        return done();
      }

      return done(null, file);
    },
  }))())
  // transpile scss to css
  .pipe(sass.sync(config.plugins.sass).on('error', sassError => config.logger.error(sassError, env.dev)))
  // pipe through postcss without minifying it
  .pipe(postcss(config.plugins.postcss))
  // write unminified files to disk
  .pipe(gulp.dest(config.dest, {
    sourcemaps: '.',
  }))
  // filter out sourcemaps from the stream, if present
  .pipe(filter(['**', '!**/*.css.map']))
  // pipe through cssnano and minify when not in dev mode
  .pipe(conditionally(!env.dev, postcss([
    cssnano(),
  ])))
  // rename to ${file}.min.css when not in dev mode
  .pipe(conditionally(!env.dev, rename({
    suffix: '.min',
  })))
  // write minified files to disk when not in dev mode
  .pipe(conditionally(!env.dev, gulp.dest(config.dest)))
  // log stats to console
  .pipe(size({
    showFiles: true,
    title: 'estatico-sass',
  }));

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
