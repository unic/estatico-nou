# estatico-handlebars

Transforms `Handlebars` to `HTML`.

## Installation

```
$ npm install --save-dev estatico-handlebars
```

## Usage

```js
const gulp = require('gulp');
const task = require('estatico-handlebars');

// Get CLI arguments
const env = require('minimist')(process.argv.slice(2));

// Options, deep-merged into defaults via _.merge
const options = {
  src: [
    './src/*.hbs',
    './src/pages/**/*.hbs',
    './src/modules/**/!(_)*.hbs',
    './src/preview/styleguide/*.hbs',
  ],
  srcBase: './src',
  dest: './dist',
  plugins: {
    handlebars: {
      partials: './src/**/*.hbs',
    },
  },
};

gulp.task('html', () => task(options, env.dev));
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
  helpers: require('handlebars-layouts'), // eslint-disable-line global-require
}
```

Passed to [`gulp-hb`](https://www.npmjs.com/package/gulp-hb).

Partials and helpers are resolved via [`handlebars-wax`](https://www.npmjs.com/package/handlebars-wax). This is happening outside of the task function, allowing us to export the handlebars instance with partials and helpers already registered. It can be required via `require('estatico-handlebars').handlebars`.

A simple helper example:
```js
{
  helpers: {
    link: object => `<a href="${object.url}">${object.text}</a>`,
    foo: bar => `<span>${bar}</span>`,
  },
}
```

If a helpers needs access to `handlebars`, a factory needs to be defined instead:
```js
{
  helpers: {
    register: (handlebars) => {
      handlebars.registerHelper('link', (object) => { // eslint-disable-line arrow-body-style
        return new handlebars.SafeString(`<a href="${object.url}">${object.text}</a>`);
      });

      handlebars.registerHelper('foo', bar => `<span>${bar}</span>`);
    },
  },
}
```

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

#### plugins.clone

Type: `Object`<br>
Default:
```js
clone: dev ? null : {
  data: {
    env: {
      dev: false,
    },
  },
  rename: filePath => filePath.replace(path.extname(filePath), `.prod${path.extname(filePath)}`),
},
```

This potentially speeds up CI builds (where the same templates are built with both a dev and prod config) since we only run the expensive task of setting up the data once.

The CI needs to take care of moving & renaming the `.prod.html` files.

### dev

Type: `Boolean`<br>
Default: `false`

Whether we are in dev mode. Some defaults are affected by this.

## License

Apache 2.0.
