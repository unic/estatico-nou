# estatico-puppeteer

Open local files in [Puppeteer](https://github.com/GoogleChrome/puppeteer)

## Installation

```
$ npm install --save-dev estatico-puppeteer
```

## Usage

```js
const gulp = require('gulp');
const task = require('estatico-puppeteer');

// Get CLI arguments
const env = require('minimist')(process.argv.slice(2));

// Options, deep-merged into defaults via _.merge
const options = {
  src: [
    './dist/{pages,modules,demo}/**/*.html',
  ],
  srcBase: './dist',
  viewports: {
    mobile: {
      width: 400,
      height: 1000,
      isMobile: true,
    },
    tablet: {
      width: 700,
      height: 1000,
      isMobile: true,
    },
    desktop: {
      width: 1400,
      height: 1000,
    },
  },
};

gulp.task('jsTest', () => task(options, env.dev));
```

Run task (assuming the project's `package.json` specifies `"scripts": { "gulp": "gulp" }`):
`$ npm run gulp jsTest`

Run with debug info:
`$ NODE_DEBUG=estatico-puppeteer npm run gulp jsTest`

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

#### viewports

Type: `Object`<br>
Default: `null`

Every item is passed to Puppeteer's [`setViewport`](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagesetviewportviewport).

#### logger

Type: `{ info: Function, debug: Function, error: Function }`<br>
Default: Instance of [`estatico-utils`](../estatico-utils)'s `Logger` utility.

Set of logger utility functions used within the task.

#### plugins

Type: `Object`

##### plugins.puppeteer

Type: `Object`<br>
Default: `null`

Passed to [Puppeteer](https://github.com/GoogleChrome/puppeteer).

##### plugins.interact

Type: `async fn(page)`<br>
Default: `null`

Interact with page (evaluating code, taking screenshots etc.). See [Puppeteer](https://github.com/GoogleChrome/puppeteer) for available API on `page` object.

### dev

Type: `Boolean`<br>
Default: `false`

Whether we are in dev mode. Some defaults are affected by this.

## License

Apache 2.0.
