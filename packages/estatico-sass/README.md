# estatico-sass

Transforms `Sass` to `CSS`.

## Installation

```
$ npm install --save-dev estatico-sass
```

## Usage

```js
const gulp = require('gulp');
const task = require('estatico-sass');

// Get CLI arguments
const env = require('minimist')(process.argv.slice(2));

// Options, deep-merged into defaults via _.merge
const options = {
  src: [
    './src/assets/css/**/*.scss',
  ],
  srcIncludes: [
    './src/',
  ],
  srcBase: './src',
  dest: './dist',
  plugins: {
    sass: {
      includePaths: [
        './src/',
      ],
    },
  },
};

gulp.task('css', () => task(options, env.dev));
```

Run task (assuming the project's `package.json` specifies `"scripts": { "gulp": "gulp" }`):
`$ npm run gulp css`

Run with debug info (showing you the autoprefixer setup, e.g.):
`$ NODE_DEBUG=estatico-sass npm run gulp css`

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

#### dest (required)

Type: `String`<br>
Default: `null`

Passed to `gulp.dest`.

#### logger

Type: `{ info: Function, debug: Function, error: Function }`<br>
Default: Instance of [`estatico-utils`](../estatico-utils)'s `Logger` utility.

Set of logger utility functions used within the task.

#### plugins

Type: `Object`

##### plugins.sass

Type: `Object`<br>
Default:
```js
{
  includePaths: null,
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

### dev

Type: `Boolean`<br>
Default: `false`

Whether we are in dev mode. Some defaults are affected by this.

## License

Apache 2.0.
