# @unic/estatico-webpack

Uses Webpack with Babel to transpile and bundle JavaScript.

## Installation

```
$ npm install --save-dev @unic/estatico-webpack
```

## Usage

```js
const gulp = require('gulp');
const env = require('minimist')(process.argv.slice(2));

/**
 * JavaScript bundling task
 * Uses Webpack with Babel to transpile and bundle JavaScript.
 *
 * Using `--watch` (or manually setting `env` to `{ dev: true }`) starts file watcher
 */
gulp.task('js', (cb) => {
  const task = require('@unic/estatico-webpack');
  const merge = require('lodash.merge');
  const glob = require('glob');

  const instance = task(defaults => ({
    webpack: [
      merge({}, defaults.webpack, {
        entry: Object.assign({
          head: './src/assets/js/head.js',
          main: './src/assets/js/main.js',
        }, env.dev ? {
          dev: './src/assets/js/dev.js',
        } : {}),
        output: {
          path: path.resolve('./dist/assets/js'),
        },
      }),
      {
        entry: {
          test: './src/preview/assets/js/test.js',
        },
        module: {
          rules: defaults.webpack.module.rules.concat([
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
        externals: {
          jquery: 'jQuery',
        },
        output: {
          path: path.resolve('./dist/preview/assets/js'),
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
        module: defaults.webpack.module,
        externals: {
          jquery: 'jQuery',
          qunit: 'QUnit',
        },
        output: {
          path: path.resolve('./dist/preview/assets/js/test'),
        },
        mode: 'development',
      },
    ],
    logger: defaults.logger,
  }), env);

  return instance(cb);
});
```

Run task (assuming the project's `package.json` specifies `"scripts": { "gulp": "gulp" }`):
`$ npm run gulp js`

Run with debug info:
`$ NODE_DEBUG=estatico-webpack npm run gulp js`

### Options

#### webpack

Type: `Object`<br>
Default:
```js
{
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
}
```

#### logger

Type: `{ info: Function, debug: Function, error: Function }`<br>
Default: Instance of [`estatico-utils`](../estatico-utils)'s `Logger` utility.

Set of logger utility functions used within the task.

## License

Apache 2.0.
