/* eslint-disable global-require, no-await-in-loop */
const { Plugin, Logger } = require('@unic/estatico-utils');
const Joi = require('joi');

// Config schema used for validation
const schema = Joi.object().keys({
  src: [Joi.string().required(), Joi.array().required()],
  srcBase: Joi.string().required(),
  dest: Joi.string().required(),
  plugins: {
    resize: Joi.object().keys({
      addSizeWatermark: Joi.boolean(),
    }),
    rename: Joi.func().required(),
    imagemin: Joi.object().allow(null),
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
const defaults = (/* env */) => ({
  src: null,
  srcBase: null,
  dest: null,
  plugins: {
    rename: (filePath, resizeConfig) => {
      const path = require('path');
      const baseName = path.basename(filePath, path.extname(filePath));

      return filePath.replace(baseName, `${baseName}_${resizeConfig.postfix}`);
    },
    resize: {
      addSizeWatermark: true,
    },
    imagemin: {},
  },
  logger: new Logger('estatico-imageversions'),
});

/**
 * Task function
 * @param {object} config - Complete task config
 * @param {object} env - Environment config, e.g. { dev: true }
 * @param {object} [watcher] - Watch file events
 * @return {object} gulp stream
 */
const task = (config, env = {}) => {
  const spawn = require('child_process').spawnSync('gm', ['-version']);

  if (spawn.error || spawn.stderr.toString()) {
    throw new Error('GraphicsMagick missing');
  }

  const gulp = require('gulp');
  const plumber = require('gulp-plumber');
  const through = require('through2');
  const gm = require('gm');
  const buffer = require('vinyl-buffer');
  const imagemin = require('gulp-imagemin');
  const Vinyl = require('vinyl');
  const path = require('path');
  const merge = require('lodash.merge');
  const size = require('gulp-size');

  const resize = require('./lib/resize');
  const extractConfig = require('./lib/config');

  let images = {};

  return gulp.src(config.src, {
    base: config.srcBase,
    read: false,
  })

    // Prevent stream from unpiping on error
    .pipe(plumber())

    // Generate config and add image files to stream
    .pipe(through.obj((file, enc, done) => {
      const imageConfig = require(file.path); // eslint-disable-line import/no-dynamic-require

      // eslint-disable-next-line no-restricted-syntax
      for (const key of Object.keys(imageConfig)) {
        const imagePath = path.resolve(path.dirname(file.path), key);

        images = merge({}, images, {
          [imagePath]: imageConfig[key],
        });
      }

      return done();
    }, async function (done) { // eslint-disable-line
      config.logger.debug('Extracted config:', images);

      // eslint-disable-next-line no-restricted-syntax
      for (const imagePath of Object.keys(images)) {
        const image = gm(imagePath).noProfile();

        // Prepare image file
        const imageFile = new Vinyl({
          base: config.srcBase,
          path: imagePath,
          contents: image.stream(),
          image, // Attach gm file instance for reuse
        });

        // Read image size, attach to file object and add file to stream
        try {
          // Attach size object to `image.data`
          await new Promise((resolve, reject) => {
            image.size((err, size) => {
              if (err) {
                return reject(err);
              }

              return resolve(size);
            });
          });

          this.push(imageFile);
        } catch (err) {
          config.logger.error(err, env.dev);
        }
      }

      return done();
    }))

    // Generate resized images
    .pipe(through.obj(function (file, enc, done) { // eslint-disable-line
      // eslint-disable-next-line no-restricted-syntax
      for (const rawConfig of images[file.path]) {
        const resizeConfig = extractConfig(file.image.data.size, rawConfig);
        const resizedImage = resize(file.image, resizeConfig, config.plugins.resize);

        const resizedFile = new Vinyl({
          base: config.srcBase,
          path: config.plugins.rename(file.path, resizeConfig),
          contents: resizedImage.stream(),
        });

        this.push(resizedFile);
      }

      return done(null, file);
    }))

    // Imagemin
    .pipe(buffer())
    .pipe(config.plugins.imagemin ? imagemin(config.plugins.imagemin).on('error', err => config.logger.error(err, env.dev)) : through.obj())

    // Log
    .pipe(size({
      showFiles: true,
      title: 'estatico-font-datauri',
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
