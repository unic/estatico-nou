# @unic/estatico-svgsprite

Uses `svgstore` to create a sprite from multiple SVGs.

## Installation

```
$ npm install --save-dev @unic/estatico-svgsprite
```

## Usage

```js
const gulp = require('gulp');
const estaticoSvgsprite = require('@unic/estatico-svgsprite');

// Get CLI arguments
const env = require('minimist')(process.argv.slice(2));

/**
 * SVG spriting task
 * Uses svgstore to create a sprite from multiple SVGs
 */
gulp.task('svgsprite', estaticoSvgsprite({
  src: {
    main: './src/assets/media/svg/**/*.svg',
    demo: './src/demo/modules/svgsprite/svg/*.svg',
  },
  srcBase: './src',
  dest: './dist',
}, env));
```

Run task (assuming the project's `package.json` specifies `"scripts": { "gulp": "gulp" }`):
`$ npm run gulp svgsprite`

## API

`plugin(options, env)` => `taskFn`

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

#### watch

Type: `Object`<br>
Default: `null`

Passed to file watcher when `--watch` is used.

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

#### logger

Type: `{ info: Function, debug: Function, error: Function }`<br>
Default: Instance of [`estatico-utils`](../estatico-utils)'s `Logger` utility.

Set of logger utility functions used within the task.

### env

Type: `Object`<br>
Default: `{}`

Result from parsing CLI arguments via `minimist`, e.g. `{ dev: true, watch: true }`. Some defaults are affected by this, see above.

## License

Apache 2.0.
