# @unic/estatico-browsersync

Uses Browsersync to serve and realod files.

## Installation

```
$ npm install --save-dev @unic/estatico-browsersync
```

## Usage

```js
const gulp = require('gulp');
const estaticoBrowsersync = require('@unic/estatico-browsersync');

// Get CLI arguments
const env = require('minimist')(process.argv.slice(2));

/**
 * Serve task
 * Uses Browsersync to serve the build directory, reloads on changes
 */
gulp.task('serve', estaticoBrowsersync({
  plugins: {
    browsersync: {
      server: './dist',
      watch: './dist/**/*.{html,css,js}',
    },
  },
}, env));
```

Run task (assuming the project's `package.json` specifies `"scripts": { "gulp": "gulp" }`):
`$ npm run gulp serve`

## API

`plugin(options, env)` => `taskFn`

### options

#### plugins

Type: `Object`

##### plugins.browsersync (required)

Type: `Object`

Passed to [`browser-sync`](https://www.npmjs.com/package/browser-sync). See https://browsersync.io/docs/options for available options.

###### plugins.browsersync.server

Type: `String`<br>
Default: `null`

Directory to serve.

###### plugins.browsersync.watch

Type: `String`<br>
Default: `null`

Files to watch and reload.

###### plugins.browsersync.port

Type: `Number`<br>
Default: `null`

On which port to expose the server.

###### plugins.browsersync.middleware

Type: `Function`<br>
Default:
```js
(req, res, next) => {
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
```

Transform requests.

#### logger

Type: `{ info: Function, debug: Function, error: Function }`<br>
Default: Instance of [`estatico-utils`](../estatico-utils)'s `Logger` utility.

Set of logger utility functions used within the task.

### env

Type: `Object`<br>
Default: `{}`

Result from parsing CLI arguments via `minimist`, e.g. `{ dev: true, watch: true }`. Currently unused.

## License

Apache 2.0.
