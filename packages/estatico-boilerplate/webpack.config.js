const defaults = require('@unic/estatico-webpack/webpack.config.js');
const env = require('minimist')(process.argv.slice(2));
const merge = require('lodash.merge');
const glob = require('glob');
const path = require('path');

module.exports = [
  merge({}, defaults, {
    entry: {
      head: './src/assets/js/head.js',
      main: './src/assets/js/main.js',
    },
    output: {
      path: path.resolve('./dist/assets/js'),
      filename: `[name]${env.dev ? '' : '.min'}.js`,
      chunkFilename: `async/[name]${env.dev ? '' : '.min'}.js`,
      publicPath: '/assets/js/',
    },
    mode: env.dev ? 'development' : 'production',
  }),
  {
    entry: {
      dev: './src/preview/assets/js/dev.js',
    },
    module: {
      rules: [
        {
          test: /(\.js|\.jsx)$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          options: {
            // See .babelrc.js
          },
        },
      ],
    },
    output: {
      path: path.resolve('./dist/preview/assets/js'),
      filename: `[name]${env.dev ? '' : '.min'}.js`
    },
    mode: 'development',
  },
  {
    entry: {
      test: './src/preview/assets/js/test.js',
    },
    module: {
      rules: defaults.module.rules.concat([
        {
          test: /jquery\.js$/,
          loader: 'expose-loader?$!expose-loader?jQuery',
        },
        {
          test: /qunit\.js$/,
          loader: 'expose-loader?QUnit',
        },
        {
          test: /\.css$/,
          loader: 'style-loader!css-loader',
        },
      ]),
    },
    output: {
      path: path.resolve('./dist/preview/assets/js'),
      filename: `[name]${env.dev ? '' : '.min'}.js`,
      chunkFilename: `async/[name]${env.dev ? '' : '.min'}.js`,
    },
    mode: 'development',
  },
  {
    // Create object of fileName:filePath pairs
    entry: glob.sync('./src/**/*.test.js').reduce((obj, item) => {
      const key = path.basename(item, path.extname(item));

      obj[key] = item; // eslint-disable-line no-param-reassign

      return obj;
    }, {}),
    module: defaults.module,
    externals: {
      jquery: 'jQuery',
      qunit: 'QUnit',
    },
    output: {
      path: path.resolve('./dist/preview/assets/js/test'),
      filename: `[name]${env.dev ? '' : '.min'}.js`,
      chunkFilename: `async/[name]${env.dev ? '' : '.min'}.js`,
    },
    mode: 'development',
  },
];
