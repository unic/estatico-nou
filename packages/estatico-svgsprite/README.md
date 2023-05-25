# @unic/estatico-svgsprite

Uses `svgstore` to create a sprite from multiple SVGs.

## Installation

```
$ npm install --save-dev @unic/estatico-svgsprite
```

## Usage

```js
const gulp = require('gulp');
const env = require('minimist')(process.argv.slice(2));

/**
 * SVG spriting task
 * Uses svgstore to create a sprite from multiple SVGs
 *
 * Using `--watch` (or manually setting `env` to `{ watch: true }`) starts file watcher
 * When combined with `--skipBuild`, the task will not run immediately but only after changes
 */
gulp.task('media:svgsprite', () => {
  const task = require('@unic/estatico-svgsprite');

  const instance = task({
    src: {
      base: './src/assets/media/svg/**/*.svg',
      demo: './src/demo/modules/svgsprite/svg/*.svg',
    },
    srcBase: './src',
    dest: './dist/assets/media/svgsprite',
  }, env);
  
  // Don't immediately run task when skipping build
  if (env.watch && env.skipBuild) {
    return instance;
  }

  return instance();
});
```

Run task (assuming the project's `package.json` specifies `"scripts": { "gulp": "gulp" }`):
`$ npm run gulp svgsprite`

See possible flags specified above.

### Client

```js
import SvgSpriteLoader from '@unic/estatico-svgsprite/lib/loader';

new SvgSpriteLoader();
```

Add config to template:
```html
<body data-svgsprites-options='["/assets/media/svgsprite/main.svg", "/assets/media/svgsprite/demo.svg"]'>
```

Optional configuration:

```js
import SvgSpriteLoader from '@unic/estatico-svgsprite/lib/loader';

new SvgSpriteLoader({
  // Class added to inserted sprites container
  containerClass: 'svgsprites',
  // Callback when sprite is loaded
  onLoaded: (name) => {
    document.documentElement.classList.add('svgsprites--loaded');
    document.documentElement.classList.add(`svgsprites--loaded-${name}`);
  },
  // Get sprites to load
  // Returns array of { name, url } objects
  getSprites: () => {
    try {
      const config = JSON.parse(document.body.dataset.svgspritesOptions);

      return config.map((url) => {
        const name = url.match(/([^/]*)\/*\.svg$/)[1];

        return { name, url };
      });
    } catch (e) {
      return null;
    }
});
```

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

##### plugins.svgo

Type: `Object`<br>
Default:
```js
svgo: {
  plugins: [
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
      removeViewBox: false,
    },
  ],
  multipass: true,
},
```

Passed to [`imagemin-svgo`](https://www.npmjs.com/package/imagemin-svgo) via [`gulp-imagemin`](https://www.npmjs.com/package/gulp-imagemin). Setting to `null` will disable this step. Otherwise it will run before piping the files to `svgstore`.

**NOTE**: Unless you pass a function instead of an object with your custom options, they are deep-merged into the defaults. So to overwrite `removeViewBox: false` above, you would have to pass `svgo: { plugins: [{}, {}, {}, { removeViewBox: true }] }`

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
