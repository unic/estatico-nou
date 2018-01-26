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

#### src (required)

Type: `Array` or `String`<br>
Default: `null`

Passed to `gulp.src`.

#### srcBase (required)

Type: `String`<br>
Default: `null`

Passed as `base` option to `gulp.src`.

#### srcIncludes

Type: `Array`<br>
Default: `[]`

Passed as `includePaths` option to `gulp-sass`.

#### dest (required)

Type: `String`<br>
Default: `null`

Passed to `gulp.dest`.

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
Default:
```js
{
  includePaths: (config) => config.srcIncludes
}
```

Passed to [`node-sass`](https://www.npmjs.com/package/node-sass) via [`gulp-sass`](https://www.npmjs.com/package/gulp-sass). `includePaths` is resolved first since we cannot pass a function there.

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

### Options recommendation for Estático

```js
{
  src: [
  './src/assets/css/**/*.scss',
  ],
  srcIncludes: [
    './src/',
  ],
  srcBase: './src',
  dest: './dist',
}
```

## License

Apache 2.0.
