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

#### errorHandler

Type: `Function`<br>
Default:
```js
(err) => {
  util.log(`estatico-handlebars${err.plugin ? ` (${err.plugin})` : null}`, util.colors.cyan(err.fileName), util.colors.red(err.message));
}
```

Function to run if an error occurs in one of the steps.

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

Whether we are in dev mode. Some defaults are affected by this.

## License

Apache 2.0.
