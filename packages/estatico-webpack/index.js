/* eslint-disable global-require, no-await-in-loop */
const { Plugin, Logger } = require('@unic/estatico-utils');
const Joi = require('joi');

// Config schema used for validation
const schema = Joi.object().keys({
  webpack: [Joi.object(), Joi.array()],
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
const defaults = (env) => {
  const UnminifiedWebpackPlugin = require('unminified-webpack-plugin');
  const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
  const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

  return {
    webpack: {
      mode: env.dev ? 'development' : 'production',
      entry: null,
      resolve: {
        alias: {
          handlebars: 'handlebars/runtime.js',
        },
      },
      module: {
        rules: [
          {
            test: /jquery\.js$/,
            loader: 'expose-loader?$!expose-loader?jQuery',
          },
          {
            test: /modernizrrc\.js$/,
            loader: 'expose-loader?Modernizr!webpack-modernizr-loader',
          },
          {
            test: /\.hbs$/,
            loader: 'handlebars-loader',
          },
          {
            test: /(\.js|\.jsx)$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', {
                  useBuiltIns: 'usage',
                  targets: {
                    browsers: ['last 2 versions'],
                  },
                  // Disabled due to https://gist.github.com/jasonphillips/57c1f8f9dbcd8b489dafcafde4fcdba6
                  // loose: true,
                }],
              ],
              plugins: [],
            },
          },
        ],
      },

      // Custom UglifyJS options
      optimization: {
        minimizer: [
          new UglifyJSPlugin({
            uglifyOptions: {
              mangle: {
                keep_fnames: true,
              },
            },
          }),
        ],
      },
      plugins: [
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          // Path to bundle report file that will be generated in `static` mode.
          // Relative to bundles output directory.
          reportFilename: 'report.html',
          openAnalyzer: false,
          logLevel: 'warn',
        }),
      ].concat(env.ci ? [
        new UnminifiedWebpackPlugin(),
      ] : []),
      output: {
        path: null,
        filename: `[name]${env.dev ? '' : '.min'}.js`,

        // Save async imports to special directory inside `output.path`
        chunkFilename: `async/[name]${env.dev ? '' : '.min'}.js`,

        // Tell webpack about asset path in the browser
        publicPath: null,
      },
    },
    logger: new Logger('estatico-webpack'),
  };
};

/**
 * Task function
 * @param {object} config - Complete task config
 * @param {object} env - Environment config, e.g. { dev: true }
 * @param {object} [watcher] - Watch file events
 * @return {object} gulp stream
 */
const task = (config, env = {}, cb) => {
  const webpack = require('webpack');
  const once = require('lodash.once');
  const { format } = require('./lib/stats');

  try {
    const compiler = webpack(config.webpack);

    const callback = (err, stats) => {
      let done = cb;

      if (env.watch) {
        done = once(done);
      }

      if (err) {
        config.errorHandler(err);
      }

      config.logger.info(format(stats));

      done();
    };

    if (env.watch) {
      compiler.watch({}, callback);
    } else {
      compiler.run(callback);
    }

    return compiler;
  } catch (err) {
    config.logger.error(err, env.dev);

    return cb();
  }
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
