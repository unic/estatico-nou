# @unic/estatico-eslint

Uses ESLint to lint and automatically fix code.

## Installation

```
$ npm install --save-dev @unic/estatico-eslint
```

## Usage

```js
const gulp = require('gulp');
const env = require('minimist')(process.argv.slice(2));

/**
 * JavaScript linting task
 * Uses ESLint to lint and autofix files
 *
 * Using `--watch` (or manually setting `env` to `{ dev: true }`) starts file watcher
 */
gulp.task('js:lint', () => {
  const task = require('@unic/estatico-eslint');

  const instance = task({
    src: [
      './src/**/*.js',
    ],
    srcBase: './src',
    dest: './src',
    watch: {
      src: [
        './src/**/*.js',
      ],
      name: 'js:lint',
    },
  }, env);

  return instance();
});
```

Run task (assuming the project's `package.json` specifies `"scripts": { "gulp": "gulp" }`):
`$ npm run gulp js:lint`

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

#### dest

Type: `String`<br>
Default: `null`

Passed to `gulp.dest` when `plugins.eslint.fix` is enabled.

#### watch

Type: `Object`<br>
Default: `null`

Passed to file watcher when `--watch` is used.

#### plugins

Type: `Object`

##### plugins.eslint

Type: `Object`<br>
Default:
```js
{
  fix: true,
}
```

Passed to [`eslint`](https://www.npmjs.com/package/eslint) via [`gulp-eslint`](https://www.npmjs.com/package/gulp-eslint).

##### plugins.changed

Type: `Object`<br>
Default:
```js
{
  firstPass: true,
}
```

Passed to [`gulp-changed-in-place`](https://www.npmjs.com/package/gulp-changed-in-place).

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
