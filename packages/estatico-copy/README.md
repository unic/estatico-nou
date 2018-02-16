# @unic/estatico-copy

Copies files, optionally renames them.

## Installation

```
$ npm install --save-dev @unic/estatico-copy
```

## Usage

```js
const gulp = require('gulp');
const env = require('minimist')(process.argv.slice(2));

/**
 * Copy files
 * Copies files, optionally renames them.
 *
 * Using `--watch` (or manually setting `env` to `{ watch: true }`) starts file watcher
 * When combined with `--skipBuild`, the task will not run immediately but only after changes
 */
gulp.task('copy', () => {
  const task = require('@unic/estatico-copy');

  const instance = task({
    src: [
      './src/**/*.{png,gif,jpg,woff,ttf}',
    ],
    srcBase: './src',
    dest: './dist',
    watch: {
      src: [
        './src/**/*.{png,gif,jpg,woff,ttf}',
      ],
      name: 'copy',
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
`$ npm run gulp copy`

See possible flags specified above.

## API

`plugin(options, env)` => `taskFn`

### options

#### src (required)

Type: `Object`<br>
Default: `null`

Each property is passed to `gulp.src`, the key is used for the generated sprite's name.

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

#### plugins

Type: `Object`

##### plugins.changed

Type: `Object`<br>
Default:
```js
{
  firstPass: true,
}
```

Passed to [`gulp-changed-in-place`](https://www.npmjs.com/package/gulp-changed-in-place).

##### plugins.rename(filePath)

Type: `Function`<br>
Default: `null`

Optional file renaming.

#### logger

Type: `{ info: Function, debug: Function, error: Function }`<br>
Default: Instance of [`estatico-utils`](../estatico-utils)'s `Logger` utility.

Set of logger utility functions used within the task.

### env

Type: `Object`<br>
Default: `{}`

Result from parsing CLI arguments via `minimist`, e.g. `{ dev: true, watch: true }`.

## License

Apache 2.0.
