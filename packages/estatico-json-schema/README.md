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
  const estaticoWatch = require('@unic/estatico-watch');
  const { schema: resolver } = require('@unic/estatico-watch/lib/resolvers');
  const instance = task({
    src: [
      './src/**/*.data.js',
    ],
    srcBase: './src',
    watch: {
      src: [
        './src/**/*.data.js',
        './src/**/*.schema.json',
      ],
      name: 'data:lint',
      dependencyGraph: {
        srcBase: './',
        // See https://github.com/unic/estatico-nou/blob/develop/packages/estatico-watch/lib/resolver.js
        resolver: resolver(),
      },
      watcher: estaticoWatch,
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

##### plugins.setup

Type: `Object`<br>
Default:
```js
{
  // Which part of the input data to validate against the schema
  // Both default data and variants will be validated
  getData: (content /* , filePath */) => {
    const defaultData = content.props;
    const variants = content.variants ? Object.values(content.variants).map(v => v.props) : [];

    return [defaultData].concat(variants);
  },
  // Where to find the schema
  // eslint-disable-next-line arrow-body-style
  getSchemaPath: (content /* , filePath */) => {
    return content.meta ? content.meta.schema : null;
  },
}
```

The result of `setup.getSchemaPath` is passed to [`json-schema-ref-parser`](https://www.npmjs.com/package/json-schema-ref-parser).

##### plugins.ajv

Type: `Object`<br>
Default:
```js
{
  allErrors: true,
}
```

Passed to [`Ajv`](https://www.npmjs.com/package/ajv#options).

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
