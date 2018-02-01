# estatico-w3c-validator

Sends HTML pages through the [w3c validator](https://validator.w3.org/).

## Installation

```
$ npm install --save-dev estatico-w3c-validator
```

## Usage

```js
const gulp = require('gulp');
const task = require('estatico-w3c-validator');

// Get CLI arguments
const env = require('minimist')(process.argv.slice(2));

// Options, deep-merged into defaults via _.merge
const options = {
  src: [
    './src/*.hbs',
    './src/pages/**/*.hbs',
    './src/demo/pages/**/*.hbs',
    './src/modules/**/!(_)*.hbs',
    './src/demo/modules/**/!(_)*.hbs',
    './src/preview/styleguide/*.hbs',
  ],
  srcBase: './src',
};

gulp.task('htmlValidate', () => task(options, env.dev));
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

Recommendation for Estático: `'./dist'`

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

### dev

Type: `Boolean`<br>
Default: `false`

Whether we are in dev mode. Some defaults might be affected by this.

## License

Apache 2.0.
