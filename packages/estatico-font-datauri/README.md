# @unic/estatico-font-datauri

Uses `gulp-simplefont64` to inline font files into base64-encoded data URIs

## Installation

```
$ npm install --save-dev @unic/estatico-font-datauri
```

## Usage

```js
const gulp = require('gulp');
const env = require('minimist')(process.argv.slice(2));

/**
 * CSS font inlining task
 * Uses `gulp-simplefont64` to inline font files into base64-encoded data URIs
 *
 * Using `--watch` (or manually setting `env` to `{ dev: true }`) starts file watcher
 */
gulp.task('css:fonts', () => {
  const task = require('@unic/estatico-font-datauri');

  const instance = task({
    src: [
      './src/assets/fonts/**/*',
    ],
    dest: './src/assets/.tmp',
    plugins: {
      concat: 'fonts.scss',
    },
    watch: {
      src: [
        './src/assets/fonts/**/*',
      ],
      name: 'css:fonts',
    },
  }, env);

  return instance();
});
```

Run task (assuming the project's `package.json` specifies `"scripts": { "gulp": "gulp" }`):
`$ npm run gulp css:fonts`

See possible flags specified above.

## API

`plugin(options, env)` => `taskFn`

### options

#### src (required)

Type: `Object`<br>
Default: `null`

Each property is passed to `gulp.src`, the key is used for the generated sprite's name.

#### dest (required)

Type: `String`<br>
Default: `null`

Passed to `gulp.dest`.

#### watch

Type: `Object`<br>
Default: `null`

Passed to file watcher when `--watch` is used.

#### plugins

Type: `Object`

##### plugins.concat (required)

Type: `String`<br>
Default: `null`

Passed to [`gulp-concat`](https://www.npmjs.com/package/gulp-concat).

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
