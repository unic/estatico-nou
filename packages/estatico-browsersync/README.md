# estatico-browsersync

Uses Browsersync to serve and realod files.

## Installation

```
$ npm install --save-dev estatico-browsersync
```

## Usage

```js
const gulp = require('gulp');
const task = require('estatico-browsersync');

// Get CLI arguments
const env = require('minimist')(process.argv.slice(2));

// Options, deep-merged into defaults via _.merge
const options = {
  plugins: {
    browsersync: {
      server: './dist',
      watch: './dist/**/*.{html,css,js}',
    },
  },
};

gulp.task('serve', () => task(options, env.dev));
```

Run task (assuming the project's `package.json` specifies `"scripts": { "gulp": "gulp" }`):
`$ npm run gulp serve`

## API

`task(options, dev)`

### options

#### logger

Type: `{ info: Function, debug: Function, error: Function }`<br>
Default: Instance of [`estatico-utils`](../estatico-utils)'s `Logger` utility.

Set of logger utility functions used within the task.

#### plugins

Type: `Object`

##### plugins.browsersync (required)

Type: `Object`<br>
Default:
```js
{
  server: null, // Required
  port: 9000,
  middleware: (req, res, next) => {
    // Rewrite POST to GET
    if (req.method === 'POST') {
      req.method = 'GET';
    }

    // Respond with optional delay
    // Example: http://localhost:9000/mocks/demo/modules/slideshow/modules.json?delay=5000
    const delay = req.url.match(/delay=([0-9]+)/);

    if (delay) {
      setTimeout(() => {
        next();
      }, delay[1]);
    } else {
      next();
    }
  },
}
```

Passed to [`browser-sync`](https://www.npmjs.com/package/browser-sync). See https://browsersync.io/docs/options for available options.

### dev

Type: `Boolean`<br>
Default: `false`

Whether we are in dev mode. An error will exit the task unless in dev mode.

## License

Apache 2.0.
