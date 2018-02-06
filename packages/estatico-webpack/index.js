// const chalk = require('chalk');
const merge = require('lodash.merge');
const webpack = require('webpack');
const UnminifiedWebpackPlugin = require('unminified-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { Logger } = require('estatico-utils');

const logger = new Logger('estatico-webpack');

const defaults = dev => ({
  webpack: {
    mode: dev ? 'development' : 'production',
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

    // Minifiy in prod mode
    plugins: [
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        // Path to bundle report file that will be generated in `static` mode.
        // Relative to bundles output directory.
        reportFilename: 'report.html',
        openAnalyzer: false,
        logLevel: 'warn',
      }),
    ].concat(dev ? [] : [
      new UnminifiedWebpackPlugin(),
    ]),
    output: {
      path: null,
      filename: `[name]${dev ? '' : '.min'}.js`,

      // Save async loaded files (using require.ensurce) in special dir
      chunkFilename: `assets/[name]${dev ? '' : '.min'}.js`,

      // Tell webpack about the asset path structure in the browser to be able to load async files
      // publicPath: path.join('/', path.relative(config.destBase, config.dest), '/'),
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

  return (cb, watch) => {
    const once = require('lodash.once'); // eslint-disable-line global-require
    const { format } = require('./lib/stats'); // eslint-disable-line global-require

    try {
      const compiler = webpack(config.webpack);

      const callback = (err, stats) => {
        let done = cb;

        if (config.watch) {
          done = once(done);
        }

        if (err) {
          config.errorHandler(err);
        }

        config.logger.info(format(stats));

        done();
      };

      if (watch) {
        compiler.watch({}, callback);
      } else {
        compiler.run(callback);
      }

      return compiler;
    } catch (err) {
      config.logger.error(err, dev);

      return cb();
    }
  };
};
