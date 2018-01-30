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

#### src (required)

Type: `Array` or `String`<br>
Default: `null`

Passed to `gulp.src`.

#### srcBase (required)

Type: `String`<br>
Default: `null`

Passed as `base` option to `gulp.src`.

#### srcPartials (required)

Type: `String`<br>
Default: `null`

Passed as `partials` option to `gulp-hb`.

#### dest (required)

Type: `String`<br>
Default: `null`

Passed to `gulp.dest`.

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

  // Register handlebars-layouts by default
  helpers: (hb) => {
    const layouts = require('handlebars-layouts'); // eslint-disable-line global-require

    hb.registerHelper(layouts(hb));

    return hb;
  },
}
```

Passed to [`gulp-hb`](https://www.npmjs.com/package/gulp-hb). `partials` is resolved first since we cannot pass a function there.

##### plugins.data

Type: `Function`<br>
Default:
```js
data: (file) => {
  // Find .data.js file with same name
  try {
    const data = require(file.path.replace(path.extname(file.path), '.data.js'));

    return Object.assign({}, data);
  } catch (e) {
    return {};
  }
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

### Options recommendation for Estático

```js
{
  src: [
    './src/*.hbs',
    './src/pages/**/*.hbs',
    './src/modules/**/!(_)*.hbs',
    './src/preview/styleguide/*.hbs',
  ],
  srcPartials: [
    './src/layouts/*.hbs',
    './src/modules/**/*.hbs',
    './src/preview/**/*.hbs',
  ]
  srcBase: './src',
  dest: './dist',
  plugins: {
    handlebars: {
      partials: './src/**/*.hbs',
    },
  },
}
```

## License

Apache 2.0.
