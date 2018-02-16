# @unic/estatico-w3c-validator

Sends HTML pages through the [w3c validator](https://validator.w3.org/).

## Installation

```
$ npm install --save-dev @unic/estatico-w3c-validator
```

## Usage

```js
const gulp = require('gulp');
const env = require('minimist')(process.argv.slice(2));

/**
 * HTML validation task
 * Sends HTML pages through the [w3c validator](https://validator.w3.org/).
 *
 * Using `--watch` (or manually setting `env` to `{ watch: true }`) starts file watcher
 */
gulp.task('html:validate', () => {
  const task = require('@unic/estatico-w3c-validator');

  const instance = task({
    src: [
      './dist/*.html',
      './dist/modules/**/*.html',
      './dist/pages/**/*.html',
    ],
    srcBase: './dist/',
    watch: {
      src: [
        './dist/*.html',
        './dist/modules/**/*.html',
        './dist/pages/**/*.html',
      ],
      name: 'html:validate',
    },
  }, env);

  return instance();
});
```

Run task (assuming the project's `package.json` specifies `"scripts": { "gulp": "gulp" }`):
`$ npm run gulp html:validate`

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

Recommendation for Estático: `'./dist'`

#### watch

Type: `Object`<br>
Default: `null`

Passed to file watcher when `--watch` is used.

#### plugins

Type: `Object`

##### plugins.w3cjs

Type: `Object`<br>
Default:
```js
{}
```

Passed to [`gulp-w3cjs`](https://www.npmjs.com/package/gulp-w3cjs).

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
