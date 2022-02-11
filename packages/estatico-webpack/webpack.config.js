const UnminifiedWebpackPlugin = require('unminified-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  resolve: {
    alias: {
      handlebars: 'handlebars/runtime.js',
    },
  },
  module: {
    rules: [{
      test: /jquery\.js$/,
      use: [{
        loader: 'expose-loader',
        options: {
          exposes: ['$', 'jQuery'],
        },
      }],
    }, {
      test: /modernizrrc\.js$/,
      use: [{
        loader: 'expose-loader',
        options: {
          exposes: ['Modernizr'],
        },
      }, {
        loader: 'webpack-modernizr-loader',
      }],
    }, {
      test: /\.hbs$/,
      use: [{
        loader: 'handlebars-loader',
      }],
    }, {
      test: /(\.jsx?)$/,
      exclude: /node_modules/,
      use: [{
        loader: 'babel-loader',
      }],
    }],
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
    new UnminifiedWebpackPlugin(),
  ],
};
