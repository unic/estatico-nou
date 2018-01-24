# estatico-mocks

Transforms `mock.js` files into `JSONs`.

## Installation

```
$ npm i -S estatico-mocks
```

## Usage

```js
const gulp = require('gulp');
const mocksTask = require('estatico-mocks');
const mocksOptions = {}; // Custom options, deep-merged into defaults via _.merge

gulp.task('mocks', () => mocksTask(mocksOptions));
```

### Options

#### src

Type: `Array` or `String`<br>
Default:
```js
[
  './src/*.data.js',
  './src/pages/**/*.data.js',
  './src/demo/pages/**/*.data.js',
  './src/modules/**/*.data.js',
  './src/demo/modules/**/*.data.js',
]
```

Passed to `gulp.src`.

#### srcBase

Type: `String`<br>
Default: `'./src'`

Passed as `base` option to `gulp.src`.

#### dest

Type: `String`<br>
Default: `'./dist'`

Passed to `gulp.dest`.

#### watch

Type: `Array`/`String`<br>
Default:
```js
[
  './src/*.(hbs|data.js|md)',
  './src/pages/**/*.(hbs|data.js|md)',
  './src/demo/pages/**/*.(hbs|data.js|md)',
  './src/modules/**/!(_)*.(hbs|data.js|md)',
  './src/demo/modules/**/!(_)*.(hbs|data.js|md)',
  './src/preview/styleguide/*.(hbs|data.js|md)',
]
```

Used in separate watch task, changes to above files will trigger the task.

#### errorHandler

Type: `Function`<br>
Default:
```js
(err) => {
  util.log(`estatico-mocks${err.plugin ? ` (${err.plugin})` : null}`, util.colors.cyan(err.fileName), util.colors.red(err.message));
}
```

Function to run if an error occurs in one of the steps.

#### plugins

Type: `Object`

##### plugins.handlebars

Type: `Object`<br>
Default:
```js
handlebars: {
  partials: [
    './src/layouts/*.hbs',
    './src/modules/**/*.hbs',
    './src/demo/modules/**/*.hbs',
    './src/preview/**/*.hbs',
  ],
  parsePartialName: (options, file) => {
    const filePath = path.relative('./src', file.path)
      // Remove extension
      .replace(path.extname(file.path), '')
      // Use forward slashes on every OS
      .replace(new RegExp(`\\${path.sep}`, 'g'), '/');

    return filePath;
  },
}
```

Passed to [`gulp-hb`](https://www.npmjs.com/package/gulp-hb).

##### plugins.data

Type: `Function`<br>
Default:
```js
data: (file) => {
  let data = {};

  // Find .data.js file with same name
  try {
    data = importFresh(file.path.replace(path.extname(file.path), '.data.js'));
  } catch (e) {} // eslint-disable-line no-empty

  return data;
}
```

Setting up data to be used in handlebars compiling.

##### plugins.prettify

Type: `Object`<br>
Default:
```js
prettify: {
  indent_with_tabs: false,
  max_preserve_newlines: 1,
}
```

Passed to [`gulp-prettify`](https://www.npmjs.com/package/gulp-prettify). Setting to `null` will disable this step.

## License

Apache 2.0.
