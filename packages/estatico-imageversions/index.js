/* eslint-disable global-require, no-await-in-loop */
const { Plugin, Logger } = require('@unic/estatico-utils');
const Joi = require('joi');

// Config schema used for validation
const schema = Joi.object().keys({
  src: [Joi.string().required(), Joi.array().required()],
  srcBase: Joi.string().required(),
  dest: Joi.string().required(),
  plugins: {
    gm: Joi.object(),
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
    gm: {},
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
  const Vinyl = require('vinyl');
  const path = require('path');
  const merge = require('lodash.merge');
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
        });

        // Read image size, attach to file object and add file to stream
        try {
          const imageSize = await new Promise((resolve, reject) => {
            image.size((err, size) => {
              if (err) {
                return reject(err);
              }

              return resolve(size);
            });
          });

          imageFile.imageSize = imageSize;

          this.push(imageFile);
        } catch (err) {
          config.logger.error(err, env.dev);
        }
      }

      return done();
    }))

    // Generate resized images
    .pipe(through.obj(function (file, enc, done) { // eslint-disable-line
      console.log(file.path);

      // eslint-disable-next-line no-restricted-syntax
      for (const resizeConfig of images[file.path]) {
        console.log(extractConfig(file.imageSize, resizeConfig));

        // const imageFile = new Vinyl({
        //   base: config.srcBase,
        //   path: imagePath,
        //   contents: image.stream(),
        // });

        // this.push(imageFile);
      }

      return done();
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
