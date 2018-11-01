# @unic/estatico-sass

Transforms Sass to CSS, uses PostCSS (autoprefixer and clean-css) to transform the output

## Installation

```
$ npm install --save-dev @unic/estatico-sass
```

## Usage

```js
const gulp = require('gulp');
const env = require('minimist')(process.argv.slice(2));

/**
 * CSS task
 * Transforms Sass to CSS, uses PostCSS (autoprefixer and clean-css) to transform the output
 *
 * Using `--dev` (or manually setting `env` to `{ dev: true }`) skips minification
 * Using `--watch` (or manually setting `env` to `{ watch: true }`) starts file watcher
 * When combined with `--skipBuild`, the task will not run immediately but only after changes
 *
 * Using `-LLLL` will display debug info like detailed autoprefixer configs
 */
gulp.task('css', () => {
  const task = require('@unic/estatico-sass');
  const estaticoWatch = require('@unic/estatico-watch');
  const { sass: resolver } = require('@unic/estatico-watch/lib/resolvers');
  const nodeSassJsonImporter = require('node-sass-json-importer');

  const instance = task({
    src: [
      './src/assets/css/**/*.scss',
      './src/preview/assets/css/**/*.scss',
    ],
    srcBase: './src/',
    dest: './dist',
    watch: {
      src: [
        './src/**/*.scss',
      ],
      name: 'css',
      dependencyGraph: {
        srcBase: './',
        // See https://github.com/unic/estatico-nou/blob/develop/packages/estatico-watch/lib/resolver.js
        resolver: resolver({
          srcBase: [
            './src/',
            './src/assets/css/',
          ],
        }),
      },
      watcher: estaticoWatch,
    },
    plugins: {
      sass: {
        includePaths: [
          './src/',
          './src/assets/css/',
        ],
        importer: [
          // Add importer being able to deal with json files like colors, e.g.
          nodeSassJsonImporter,
        ],
      },
      // Use task default (autoprefixer with .browserslistrc config)
      // postcss: [],
    },
  }, env);

  // Don't immediately run task when skipping build
  if (env.watch && env.skipBuild) {
    return instance;
  }

  return instance();
});
```

Run task (assuming the project's `package.json` specifies `"scripts": { "gulp": "gulp" }`):
`$ npm run gulp css`

See possible flags specified above.

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

#### watch

Type: `Object`<br>
Default: `null`

Passed to file watcher when `--watch` is used.

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

##### plugins.postcss

Type: `Array`<br>
Default:
```js
[
  // Run autoprefixer
  autoprefixer({
    browsers: ['last 1 version'],
  }),
].concat(env.dev ? [] : 
  // Minifiy files with .min in their name, has to correspond to `config.minifiedSuffix`
  filterStream(['**/*', '!**/*.min*'], clean()
))
```

Passed to [`gulp-postcss`](https://www.npmjs.com/package/gulp-postcss). Setting to `null` will disable this step.

##### plugins.clone

Type: `Boolean`<br>
Default: `env.ci`

If true, every input file will be duplicated (with `config.minifiedSuffix` added to their name). This allows us to create both minified and unminified versions in one single go.

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
