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

gulp.task('css:stylelint', () => styleLintTask(styleLintOptions));
```

### Options

#### src

Type: `Array` or `String`<br>
Default: `null`

Passed to `gulp.src`.

Recommendation for Estático:
```js
[
  './src/assets/css/*.scss',
]
```

#### srcBase

Type: `String`<br>
Default: `null`

Passed as `base` option to `gulp.src`.

Recommendation for Estático: `'./src'`

#### Plugins

Type: `Object`

## License

The MIT License (MIT)
