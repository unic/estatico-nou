# estatico-w3c-validator

Sends HTML pages through the [w3c validator](https://validator.w3.org/).

## Installation

```
$ npm i -S estatico-w3c-validator
```

## Usage

```js
const gulp = require('gulp');
const validateTask = require('estatico-w3c-validator');
const validateOptions = {}; // Custom options, deep-merged into defaults via _.merge

gulp.task('html:validate', () => validateTask(validateOptions));
```

### Options

#### src

Type: `Array` or `String`<br>
Default: `null`

Passed to `gulp.src`.

Recommendation for Estático:
```js
[
  './src/*.hbs',
  './src/pages/**/*.hbs',
  './src/demo/pages/**/*.hbs',
  './src/modules/**/!(_)*.hbs',
  './src/demo/modules/**/!(_)*.hbs',
  './src/preview/styleguide/*.hbs',
]
```

#### srcBase

Type: `String`<br>
Default: `null`

Passed as `base` option to `gulp.src`.

Recommendation for Estático: `'./dist'`

#### watch

Type: `Array`/`String`<br>
Default: `null`

Used in separate watch task, changes to above files will trigger the task.

Recommendation for Estático:
```js
[
  './dist/*.html',
  './dist/modules/**/*.html',
  './dist/pages/**/*.html',
]
```

#### errorHandler

Type: `Function`<br>
Default:
```js
(err) => {
  log(`estatico-w3c-validator${err.plugin ? ` (${err.plugin})` : null}`, chalk.cyan(err.fileName), chalk.red(err.message));
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
