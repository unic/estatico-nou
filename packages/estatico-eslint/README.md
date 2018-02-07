# @unic/estatico-eslint

Uses ESLint to lint and automatically fix code.

## Installation

```
$ npm install --save-dev @unic/estatico-eslint
```

## Usage

```js
const gulp = require('gulp');
const task = require('@unic/estatico-eslint');

// Get CLI arguments
const env = require('minimist')(process.argv.slice(2));

// Options, deep-merged into defaults via _.merge
const options = {
  src: [
    './src/**/*.js',
  ],
  srcBase: './src',
  dest: './src',
};

gulp.task('jsLint', () => task(options, env.dev));
```

Run task (assuming the project's `package.json` specifies `"scripts": { "gulp": "gulp" }`):
`$ npm run gulp jsLint`

## API

`task(options, isDev)`

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

#### logger

Type: `{ info: Function, debug: Function, error: Function }`<br>
Default: Instance of [`estatico-utils`](../estatico-utils)'s `Logger` utility.

Set of logger utility functions used within the task.

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

### dev

Type: `Boolean`<br>
Default: `false`

Whether we are in dev mode. An error will exit the task unless in dev mode.

## License

Apache 2.0.
