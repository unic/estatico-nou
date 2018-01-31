const log = require('fancy-log');
const chalk = require('chalk');
const merge = require('lodash.merge');

const defaults = {
  entries: null,
  dest: null,
  destBase: null,
  plugins: {
    uglify: {
    },
  },
  errorHandler: (err) => {
    log(`estatico-webpack${err.plugin ? ` (${err.plugin})` : null}`, chalk.cyan(err.fileName), chalk.red(err.message));
  },
  dev: false,
};

module.exports = (options) => {
  let config = {};

  if (typeof options === 'function') {
    config = options(defaults);
  } else {
    config = merge({}, defaults, options);
  }

  // Validate options
  if (!config.entries) {
    throw new Error('\'options.entries\' is missing');
  }
  if (!config.dest) {
    throw new Error('\'options.dest\' is missing');
  }

  return (cb) => {
    const webpack = require('webpack'); // eslint-disable-line global-require
    const UnminifiedWebpackPlugin = require('unminified-webpack-plugin'); // eslint-disable-line global-require
    const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer'); // eslint-disable-line global-require
    const once = require('lodash.once'); // eslint-disable-line global-require
    const logStats = require('./lib/log'); // eslint-disable-line global-require

    const compiler = webpack({
      entry: config.entries,
      resolve: {
        alias: {
          handlebars: 'handlebars/runtime.js',
        },
      },
      module: {
        loaders: [
          {
            test: /jquery\.js$/,
            loader: 'expose-loader?$!expose?jQuery',
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
                  loose: true,
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
        }),
        new webpack.DefinePlugin({
          'process.env': {
            NODE_ENV: JSON.stringify('production'),
          },
        }),
        new webpack.optimize.UglifyJsPlugin(config.plugins.uglify),
        new UnminifiedWebpackPlugin(),
      ],
      output: {
        path: config.dest,
        filename: '[name].min.js',

        // Save async loaded files (using require.ensurce) in special dir
        chunkFilename: `${config.destAsyncSuffix}[name].min.js`,

        // Tell webpack about the asset path structure in the browser to be able to load async files
        // publicPath: path.join('/', path.relative(config.destBase, config.dest), '/'),
      },
      devtool: config.dev ? 'eval-cheap-module-source-map' : false,
    });

    const callback = (err, stats) => {
      let done = cb;

      if (config.watch) {
        done = once(done);
      }

      if (err) {
        config.errorHandler(err);
      }

      logStats(stats, 'estatico-webpack');

      done();
    };

    if (config.watch) {
      compiler.watch({}, callback);
    } else {
      compiler.run(callback);
    }

    return compiler;
  };
};
