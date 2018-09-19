# @unic/estatico-stylelint

Uses Stylelint to lint (and possibly autofix files in the future)

## Installation

```
$ npm install --save-dev @unic/estatico-stylelint
```

## Usage

```js
const gulp = require('gulp');
const env = require('minimist')(process.argv.slice(2));

/**
 * CSS linting task
 * Uses Stylelint to lint (and possibly autofix files in the future)
 *
 * Using `--watch` (or manually setting `env` to `{ watch: true }`) starts file watcher
 * When combined with `--skipBuild`, the task will not run immediately but only after changes
 * Adding `--fix` will auto-fix issues and save the files back to the file system
 */
gulp.task('css:lint', () => {
  const task = require('@unic/estatico-stylelint');

  const instance = task({
    src: [
      './src/**/*.scss',
    ],
    srcBase: './src/',
    dest: './dist',
    watch: {
      src: [
        './src/**/*.scss',
      ],
      name: 'css:lint',
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
`$ npm run gulp css:lint`

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

#### dest

Type: `String`<br>
Default: `null`

Passed to `gulp.dest` when chosing to write back to dics (not yet implemented).

#### watch

Type: `Object`<br>
Default: `null`

Passed to file watcher when `--watch` is used.

#### plugins

Type: `Object`

##### plugins.stylelint

Type: `Object`<br>
Default:
```js
{
  failAfterError: true,
  reporters: [
    {
      formatter: 'string',
      console: true,
    },
  ],
}
```

Passed to [`gulp-stylelint`](https://www.npmjs.com/package/gulp-stylelint).

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
