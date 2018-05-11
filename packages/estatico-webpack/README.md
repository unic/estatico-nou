# @unic/estatico-webpack

Uses Webpack with Babel to transpile and bundle JavaScript.

## Installation

```
$ npm install --save-dev @unic/estatico-webpack
```

## Usage

It is recommended to use the tools' default config files. Specifically, creating a `webpack.config.js`, `.babelrc.js` and `.browserslistrc`, possibly extending the default ones. The webpack config needs to be passed to the task, babel and browserslist are picked up automagically.

```js
const gulp = require('gulp');

/**
 * JavaScript bundling task
 * Uses Webpack with Babel to transpile and bundle JavaScript.
 *
 * Using `--watch` (or manually setting `env` to `{ watch: true }`) starts file watcher
 */
gulp.task('js', (cb) => {
  const task = require('@unic/estatico-webpack');
  const webpackConfig = require('./webpack.config.js');

  const instance = task(defaults => ({
    webpack: webpackConfig,
    logger: defaults.logger,
  }), env);

  return instance(cb);
});
```

`webpack.config.js` extending the default one:

```js
const defaults = require('@unic/estatico-webpack/webpack.config.js');
const env = require('minimist')(process.argv.slice(2));
const merge = require('lodash.merge');
const path = require('path');

module.exports = merge({}, defaults, {
  entry: Object.assign({
    head: './src/assets/js/head.js',
    main: './src/assets/js/main.js',
  }, (env.dev || env.ci) ? {
    dev: './src/assets/js/dev.js',
  } : {}),
  output: {
    path: path.resolve('./dist/assets/js'),
    filename: `[name]${env.dev ? '' : '.min'}.js`,
    chunkFilename: `async/[name]${env.dev ? '' : '.min'}.js`,
    publicPath: '/assets/js/',
  },
  mode: env.dev ? 'development' : 'production',
});

```

`.babelrc.js` extending the default one:

```js
const defaults = require('@unic/estatico-webpack/.babelrc.js');

module.exports = defaults;

```

`.browserslistrc`:

```js
> 1%

```

Run task (assuming the project's `package.json` specifies `"scripts": { "gulp": "gulp" }`):
`$ npm run gulp js`

See possible flags specified above.

## API

`plugin(options, env)` => `taskFn`

### Options

#### webpack

Type: `Object`<br>
Default:
```js
{
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
}
```

#### logger

Type: `{ info: Function, debug: Function, error: Function }`<br>
Default: Instance of [`estatico-utils`](../estatico-utils)'s `Logger` utility.

Set of logger utility functions used within the task.

## License

Apache 2.0.
