# @unic/estatico-sass

Transforms `Sass` to `CSS`.

## Installation

```
$ npm install --save-dev @unic/estatico-sass
```

## Usage

```js
const gulp = require('gulp');
const estaticoSass = require('@unic/estatico-sass');

// Get CLI arguments, will return { dev: true } if --dev is set, e.g.
const env = require('minimist')(process.argv.slice(2));

/**
 * CSS task
 * Transforms Sass to CSS, uses PostCSS (autoprefixer and clean-css) to transform the output
 *
 * Using `--dev` (or manually setting `env` to `{ dev: true }`) skips minification
 * Using `--watch` (or manually setting `env` to `{ dev: true }`) starts file watcher
 */
gulp.task('css', estaticoSass({
  src: [
    './src/assets/css/**/*.scss',
    './src/preview/assets/css/**/*.scss',
  ],
  srcBase: './src/',
  dest: './dist',
  plugins: {
    sass: {
      includePaths: [
        './src/',
        './src/assets/css/',
      ],
      importer: [
        // Add importer being able to deal with json files like colors, e.g.
        require('node-sass-json-importer'),
      ],
    },
  },
  watch: {
    src: [
      './src/**/*.scss',
    ],
    name: 'css', // Displayed in watch log
  },
}, env));
```

Run task (assuming the project's `package.json` specifies `"scripts": { "gulp": "gulp" }`):
`$ npm run gulp css`

Run with debug info (showing you the autoprefixer setup, e.g.):
`$ NODE_DEBUG=estatico-sass npm run gulp css`

## API

`plugin(options, env)` => `taskFn`

### options

#### src (required)

Type: `Array` or `String`<br>
Default: `null`

Passed to `gulp.src`.

#### srcBase (required)

Type: `String`<br>
Default: `null`

Passed as `base` option to `gulp.src`.

#### dest (required)

Type: `String`<br>
Default: `null`

Passed to `gulp.dest`.

#### minifiedSuffix

Type: `String`<br>
Default: `.min`

Added to the name of minified files.

#### plugins

Type: `Object`

##### plugins.sass

Type: `Object`<br>
Default:
```js
{
  includePaths: null,
}
```

Passed to [`node-sass`](https://www.npmjs.com/package/node-sass) via [`gulp-sass`](https://www.npmjs.com/package/gulp-sass). `includePaths` is resolved first since we cannot pass a function there.

##### plugins.autoprefixer

Type: `Object`<br>
Default:
```js
{
  browsers: ['last 1 version'],
}
```

Passed to [`autoprefixer`](https://www.npmjs.com/package/autoprefixer) via [`gulp-postcss`](https://www.npmjs.com/package/gulp-postcss). Setting to `null` will disable this step.

##### plugins.clean

Type: `Object`<br>
Default: `env.dev ? null : {}`

Passed to [`postcss-clean`](https://www.npmjs.com/package/postcss-clean) via [`gulp-postcss`](https://www.npmjs.com/package/gulp-postcss). Setting to `null` will disable this step.

#### logger

Type: `{ info: Function, debug: Function, error: Function }`<br>
Default: Instance of [`estatico-utils`](../estatico-utils)'s `Logger` utility.

Set of logger utility functions used within the task.

### env

Type: `Object`<br>
Default: `{}`

Result from parsing CLI arguments via `minimist`, e.g. `{ dev: true, watch: true }`. Some defaults are affected by this, see above.

## License

Apache 2.0.
