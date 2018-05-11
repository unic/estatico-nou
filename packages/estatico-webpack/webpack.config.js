const UnminifiedWebpackPlugin = require('unminified-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
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
          // See .babelrc.js
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
    new UnminifiedWebpackPlugin(),
  ],
};
