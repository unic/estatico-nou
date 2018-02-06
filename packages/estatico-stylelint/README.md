# estatico-stylelint

Checks SCSS for errors and warnings.

## Installation

```
$ npm install --save-dev estatico-stylelint
```

## Usage

```js
const gulp = require('gulp');
const task = require('estatico-stylelint');

// Get CLI arguments
const env = require('minimist')(process.argv.slice(2));

// Options, deep-merged into defaults via _.merge
const options = {
  src: [
    './src/assets/css/*.scss',
  ],
  srcBase: './src',
  dest: './dist',
};

gulp.task('cssLint', () => task(options, env.dev));
```

Run task (assuming the project's `package.json` specifies `"scripts": { "gulp": "gulp" }`):
`$ npm run gulp cssLint`

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

##### plugins.stylelint

Type: `Object`<br>
Default:
```js
stylelint: {
  failAfterError: true,
  reporters: [
    { formatter: 'string', console: true },
  ],
}
```

Passed to [`gulp-stylelint`](https://www.npmjs.com/package/gulp-stylelint).

### dev

Type: `Boolean`<br>
Default: `false`

Whether we are in dev mode. Some defaults might be affected by this.

## License

Apache 2.0.
