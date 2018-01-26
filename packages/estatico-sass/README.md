# estatico-sass

Transforms `Sass` to `CSS`.

## Installation

```
$ npm i -S estatico-sass
```

## Usage

```js
const gulp = require('gulp');
const sassTask = require('estatico-sass');
const sassOptions = {}; // Custom options, deep-merged into defaults via _.merge

gulp.task('css', () => sassTask(sassOptions));
```

### Options

#### src

Type: `Array` or `String`<br>
Default: `null`

Passed to `gulp.src`.

Recommendation for Estático:
```js
[
  './src/assets/css/**/*.scss',
]
```

#### srcBase

Type: `String`<br>
Default: `null`

Passed as `base` option to `gulp.src`.

Recommendation for Estático: `'./src'`

#### dest

Type: `String`<br>
Default: `null`

Passed to `gulp.dest`.

Recommendation for Estático: `'./dist'`

#### errorHandler

Type: `Function`<br>
Default:
```js
(err) => {
  util.log(`estatico-sass${err.plugin ? ` (${err.plugin})` : null}`, util.colors.cyan(err.fileName), util.colors.red(err.message));
}
```

Function to run if an error occurs in one of the steps.

#### plugins

Type: `Object`

##### plugins.sass

Type: `Object`<br>
Default: `{}`

Recommendation for Estático: 
```js
{
  includePaths: [
    './src/',
  ]
}
```

Passed to [`node-sass`](https://www.npmjs.com/package/node-sass) via [`gulp-sass`](https://www.npmjs.com/package/gulp-sass).

##### plugins.autoprefixer

Type: `Object`<br>
Default:
```js
{
  browsers: ['last 1 version'],
}
```

Passed to [`autoprefixer`](https://www.npmjs.com/package/autoprefixer) via [`gulp-postcss`](https://www.npmjs.com/package/gulp-postcss). Setting to `null` will disable this step.

##### plugins.clean

Type: `Object`<br>
Default: `{}`

Passed to [`postcss-clean`](https://www.npmjs.com/package/postcss-clean) via [`gulp-postcss`](https://www.npmjs.com/package/gulp-postcss). Setting to `null` will disable this step.

## License

Apache 2.0.
