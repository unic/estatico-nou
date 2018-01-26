# estatico-stylelint

Checks SCSS for errors and warnings.

## Installation

```
$ npm i -S estatico-stylelint
```

## Usage

```js
const gulp = require('gulp');
const styleLintTask = require('estatico-stylelint');
const styleLintOptions = {}; // Custom options, deep-merged into defaults via _.merge

gulp.task('cssLint', () => styleLintTask(styleLintOptions));
```

### Options

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

#### Plugins

Type: `Object`

### Options recommendation for Estático

```js
{
  src: [
    './src/assets/css/*.scss',
  ],
  srcBase: './src',
  dest: './dist',
}
```

## License

Apache 2.0.
