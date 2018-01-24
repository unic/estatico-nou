# estatico-style-lint

Checks SCSS for errors and warnings.

## Installation

```
$ npm i -S estatico-style-lint
```

## Usage

```js
const gulp = require('gulp');
const styleLintTask = require('estatico-style-lint');
const styleLintOptions = {}; // Custom options, deep-merged into defaults via _.merge

gulp.task('css:stylelint', () => styleLintTask(styleLintOptions));
```

### Options

#### src

Type: `Array` or `String`<br>
Default:
```js
[
  './src/modules/**/*.scss'
]
```

Passed to `gulp.src`.

#### srcBase

Type: `String`<br>
Default: `'./src'`

Passed as `base` option to `gulp.src`.

#### watch

Type: `Array`/`String`<br>
Default:
```js
[
  './src/modules/**/*.scss'
]
```

Used in separate watch task, changes to above files will trigger the task.

#### Plugins

Type: `Object`

## License

The MIT License (MIT)
