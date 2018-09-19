const defaults = require('@unic/estatico-webpack/webpack.config.js');
const env = require('minimist')(process.argv.slice(2));
const merge = require('lodash.merge');
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
      filename: `[name]${env.dev ? '' : '.min'}.js`,
    },
    mode: 'development',
  },
];
