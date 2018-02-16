# @unic/estatico-json-mocks

Creates static JSON data mocks

## Installation

```
$ npm install --save-dev @unic/estatico-json-mocks
```

## Usage

```js
const gulp = require('gulp');
const env = require('minimist')(process.argv.slice(2));

/**
 * JavaScript data mocks
 * Creates static JSON data mocks
 *
 * Using `--watch` (or manually setting `env` to `{ watch: true }`) starts file watcher
 */
gulp.task('js:mocks', () => {
  const task = require('@unic/estatico-json-mocks');

  const instance = task({
    src: [
      './src/**/*.mock.js',
    ],
    srcBase: './src',
    dest: './dist/mocks',
    watch: {
      src: [
        './src/**/*.mock.js',
      ],
      name: 'js:mocks',
    },
  }, env);

  return instance();
});
```

Run task (assuming the project's `package.json` specifies `"scripts": { "gulp": "gulp" }`):
`$ npm run gulp js:mocks`

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

##### plugins.rename

Type: `Function`<br>
Default: `filePath => filePath.replace('.mock.js', '.json')`

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
