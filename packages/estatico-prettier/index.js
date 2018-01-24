const defaults = {
  src: [
    './source/**/*.js'
  ],
  srcBase: './source',
  dest: './source',
  plugins: {
    prettier: {
      singleQuote: true,
      semi: false
    }
  },
  errorHandler: (error) => {
    const util = require('gulp-util')

    util.log(error.plugin, util.colors.cyan(error.fileName), util.colors.red(error.message))
  },
  watch: [
    './source/**/*.js'
  ]
}

const fn = (config, fileEvents, cb) => {
  const gulp = require('gulp')
  const through = require('through2')
  const prettier = require('prettier')
  const path = require('path')

  if (typeof fileEvents === 'function') {
    cb = fileEvents
    fileEvents = null
  }

  return gulp.src(config.src, {
    base: config.srcBase
  })
    .pipe(through.obj((file, enc, done) => {
      const options = Object.assign({
        parser: path.extname(file.path) === '.scss' ? 'postcss' : 'babylon'
      }, config.plugins.prettier)

      let content = file.contents.toString()

      content = prettier.format(content, options)

      file.contents = Buffer.from(content)

      return done(null, file)
    }))

    .pipe(gulp.dest(config.dest))

    // (Optional) callback
    .on('finish', cb || (() => {}))
}

module.exports = (options) => {
  const merge = require('lodash.merge')

  const config = merge({}, defaults, options)

  return {
    defaults,
    config,
    fn: fn.bind(null, config)
  }
}
