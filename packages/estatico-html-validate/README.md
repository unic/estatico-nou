# estatico-html-validate

Sends HTML pages through the [w3c validator](https://validator.w3.org/).

## Installation

```
$ npm i -S estatico-html-validate
```

## Usage

```js
const gulp = require('gulp');
const validateTask = require('estatico-html-validate');
const validateOptions = {}; // Custom options, deep-merged into defaults via _.merge

gulp.task('html:validate', () => validateTask(validateOptions));
```

### Options

#### src

Type: `Array` or `String`<br>
Default:
```js
[
  './dist/*.html',
  './dist/modules/**/*.html',
  './dist/pages/**/*.html',
]
```

Passed to `gulp.src`.

#### srcBase

Type: `String`<br>
Default: `'./dist'`

Passed as `base` option to `gulp.src`.

#### watch

Type: `Array`/`String`<br>
Default:
```js
[
  './dist/*.html',
  './dist/modules/**/*.html',
  './dist/pages/**/*.html',
]
```

Used in separate watch task, changes to above files will trigger the task.

#### errorHandler

Type: `Function`<br>
Default:
```js
(err) => {
  log(`estatico-html-validate${err.plugin ? ` (${err.plugin})` : null}`, chalk.cyan(err.fileName), chalk.red(err.message));
}
```

Function to run if an error occurs in one of the steps.

#### plugins

Type: `Object`

##### plugins.w3cjs

Type: `Object`<br>
Default:
```js
{}
```

Passed to [`gulp-w3cjs`](https://www.npmjs.com/package/gulp-w3cjs).

## License

Apache 2.0.
