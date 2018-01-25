# estatico-handlebars

Transforms `Handlebars` to `HTML`.

## Installation

```
$ npm i -S estatico-handlebars
```

## Usage

```js
const gulp = require('gulp');
const handlebarsTask = require('estatico-handlebars');
const handlebarsOptions = {}; // Custom options, deep-merged into defaults via _.merge

gulp.task('html', () => handlebarsTask(handlebarsOptions));
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
  util.log(`estatico-handlebars${err.plugin ? ` (${err.plugin})` : null}`, util.colors.cyan(err.fileName), util.colors.red(err.message));
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
  partials: null,
  // We are passing the task's config as a first parameter
  parsePartialName: (config, options, file) => {
    const filePath = path.relative(config.srcBase, file.path)
      // Remove extension
      .replace(path.extname(file.path), '')
      // Use forward slashes on every OS
      .replace(new RegExp(`\\${path.sep}`, 'g'), '/');

    return filePath;
  },
}
```

Passed to [`gulp-hb`](https://www.npmjs.com/package/gulp-hb).

Recommendation for Estático:
```js
{
  partials: [
    './src/layouts/*.hbs',
    './src/modules/**/*.hbs',
    './src/demo/modules/**/*.hbs',
    './src/preview/**/*.hbs',
  ]
}
```

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

Setting up data to be used in handlebars compiling. Return value will be assigned to `file.data` where [`gulp-hb`](https://www.npmjs.com/package/gulp-hb) picks it up.

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
