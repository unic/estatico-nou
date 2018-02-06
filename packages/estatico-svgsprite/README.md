# estatico-svgsprite

Transforms `SVGs` into sprites.

## Installation

```
$ npm install --save-dev estatico-svgsprite
```

## Usage

```js
const gulp = require('gulp');
const task = require('estatico-svgsprite');

// Get CLI arguments
const env = require('minimist')(process.argv.slice(2));

// Options, deep-merged into defaults via _.merge
const options = {
  src: {
    main: './src/assets/media/svg/**/*.svg',
  },
  srcBase: './src',
  dest: './dist',
};

gulp.task('svgsprite', () => task(options, env.dev));
```

Run task (assuming the project's `package.json` specifies `"scripts": { "gulp": "gulp" }`):
`$ npm run gulp svgsprite`

Run with debug info (showing you the autoprefixer setup, e.g.):
`$ NODE_DEBUG=estatico-svgsprite npm run gulp svgsprite`

## API

`task(options, isDev)`

### options

#### src (required)

Type: `Object`<br>
Default: `null`

Each property is passed to `gulp.src`, the key is used for the generated sprite's name.

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

##### plugins.svgstore

Type: `Object`<br>
Default:
```js
{
  inlineSvg: true,
},
```

Passed to [`gulp-svgstore`](https://www.npmjs.com/package/gulp-svgstore).

##### plugins.imagemin

Type: `Object`<br>
Default:
```js
imagemin: {
  svgoPlugins: [
    {
      cleanupIDs: {
        remove: false,
      },
    },
    {
      cleanupNumericValues: {
        floatPrecision: 2,
      },
    },
    {
      removeStyleElement: true,
    },
    {
      removeTitle: true,
    },
  ],
  multipass: true,
},
```

Passed to [`imagemin`](https://www.npmjs.com/package/imagemin) via [`gulp-imagemin`](https://www.npmjs.com/package/gulp-imagemin). Setting to `null` will disable this step. Otherwise it will run before piping the files to `svgstore`.

### dev

Type: `Boolean`<br>
Default: `false`

Whether we are in dev mode. Some defaults are affected by this.

## License

Apache 2.0.
