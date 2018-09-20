# @unic/estatico-json-schema

Uses [`Ajv`](https://www.npmjs.com/package/ajv) to validate input files against a [`JSON schema`](http://json-schema.org).

## Installation

```
$ npm install --save-dev @unic/estatico-json-schema
```

## Usage

Specify gulp task:
```js
const gulp = require('gulp');
const env = require('minimist')(process.argv.slice(2));

/**
 * Lint data file structure
 * Uses Ajv to to validate against a JSON schema
 *
 * Using `--watch` (or manually setting `env` to `{ watch: true }`) starts file watcher
 * When combined with `--skipBuild`, the task will not run immediately but only after changes
 */
gulp.task('data:lint', () => {
  const task = require('@unic/estatico-json-schema');

  const instance = task({
    src: [
      './src/**/*.data.js',
    ],
    srcBase: './src',
    watch: {
      src: [
      './src/**/*.data.js',
      ],
      name: 'data:lint',
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
`$ npm run gulp data:lint`

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

#### watch

Type: `Object`<br>
Default: `null`

Passed to file watcher when `--watch` is used.

#### plugins

Type: `Object`

##### plugins.input

Type: `Object`<br>
Default:
```js
{
  // Which part of the input data to validate against the schema
  // Returning an array will validate each item
  getData: (data) => {
    const defaultData = data.props;
    const variants = data.variants ? data.variants.map(variant => variant.props) : [];

    return [defaultData].concat(variants);
  },
  // Where to find the schema
  getSchemaPath: filePath => filePath.replace(/\.data\.js$/, '.schema.json'),
}
```

Passed to [`Ajv`](https://www.npmjs.com/package/ajv#options).

##### plugins.ajv

Type: `Object`<br>
Default:
```js
{
  allErrors: true,
}
```

Passed to [`Ajv`](https://www.npmjs.com/package/ajv#options).

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
