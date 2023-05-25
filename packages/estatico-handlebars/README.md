# @unic/estatico-handlebars

Transforms `Handlebars` to `HTML`.

## Installation

```
$ npm install --save-dev @unic/estatico-handlebars
```

## Usage

```js
const gulp = require('gulp');
const path = require('path');
const env = require('minimist')(process.argv.slice(2));

/**
 * HTML task
 * Transforms Handlebars to HTML
 *
 * Using `--watch` (or manually setting `env` to `{ watch: true }`) starts file watcher
 * When combined with `--skipBuild`, the task will not run immediately but only after changes
 *
 * Using `-LLLL` will display debug info like the data used for every template
 */
gulp.task('html', () => {
  const task = require('@unic/estatico-handlebars');
  const estaticoWatch = require('@unic/estatico-watch');
  const { readFileSyncCached } = require('@unic/estatico-utils');

  const instance = task({
    src: [
      './src/*.hbs',
      './src/pages/**/*.hbs',
      './src/demo/pages/**/*.hbs',
      '!./src/demo/pages/handlebars/*.hbs',
      './src/modules/**/!(_)*.hbs',
      './src/demo/modules/**/!(_)*.hbs',
      './src/preview/styleguide/*.hbs',
      '!./src/preview/styleguide/colors.hbs',
    ],
    srcBase: './src',
    dest: './dist',
    watch: {
      src: [
        './src/**/*.hbs',
        './src/**/*.data.js',
      ],
      name: 'html',
      dependencyGraph: {
        srcBase: './',
        resolver: {
          hbs: {
            match: /{{(?:>|#extend)[\s-]*["|']?([^"\s(]+).*?}}/g,
            resolve: (match /* , filePath */) => {
              if (!match[1]) {
                return null;
              }

              let resolvedPath = path.resolve('./src', match[1]);

              // Add extension
              resolvedPath = `${resolvedPath}.hbs`;

              return resolvedPath;
            },
          },
          js: {
            match: /require\('(.*?\.data\.js)'\)/g,
            resolve: (match, filePath) => {
              if (!match[1]) {
                return null;
              }

              return path.resolve(path.dirname(filePath), match[1]);
            },
          },
        },
      },
      watcher: estaticoWatch,
    },
    plugins: {
      clone: null,
      handlebars: {
        partials: [
          './src/**/*.hbs',
        ],
      },
      // Wrap with module layout
      transformBefore: (file) => {
        if (file.path.match(/(\\|\/)modules(\\|\/)/)) {
          return Buffer.from(readFileSyncCached('./src/preview/layouts/module.hbs'));
        }

        return file.contents;
      },
      // Relativify absolute paths
      transformAfter: (file) => {
        let content = file.contents.toString();
        let relPathPrefix = path.join(path.relative(file.path, './src'));

        relPathPrefix = relPathPrefix
          .replace(new RegExp(`\\${path.sep}g`), '/') // Normalize path separator
          .replace(/\.\.$/, ''); // Remove trailing ..

        content = content.replace(/('|")\/(?!\^)/g, `$1${relPathPrefix}`);

        content = Buffer.from(content);

        return content;
      },
    },
  }, env);
  
  // Don't immediately run task when skipping build
  if (env.watch && env.skipBuild) {
    return instance;
  }

  return instance();
});
```

Run task (assuming the project's `package.json` specifies `"scripts": { "gulp": "gulp" }`):
`$ npm run gulp html`

See possible flags specified above.


## API

`plugin(options, env)` => `taskFn`

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

#### watch

Type: `Object`<br>
Default: `null`

Passed to file watcher when `--watch` is used.

#### plugins

Type: `Object`

##### plugins.handlebars

Type: `Object`<br>
Default:
```js
handlebars: {
  partials: null,
  helpers: null, // NOTE: handlebars-layouts are registered by default
}
```

Passed to [`gulp-hb`](https://www.npmjs.com/package/gulp-hb).

Partials and helpers are resolved via [`handlebars-wax`](https://www.npmjs.com/package/handlebars-wax). This is happening outside of the task function, allowing us to export the handlebars instance with partials and helpers already registered. It can be required via `require('@unic/estatico-handlebars').handlebars`.

A simple helper example:
```js
{
  helpers: {
    link: object => `<a href="${object.url}">${object.text}</a>`,
    foo: bar => `<span>${bar}</span>`,
  },
}
```

If a helpers needs access to `handlebars`, a factory has to be used instead (see docs on [handlebars-wax](https://github.com/shannonmoeller/handlebars-wax#exporting-a-factory)):
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

*NOTE*: [handlebars-layouts](https://github.com/shannonmoeller/handlebars-layouts)) is registered by default

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
clone: env.ci ? (file) => {
  const path = require('path');
  const merge = require('lodash.merge');

  const clone = file.clone();

  // Extend default data
  clone.data = merge({}, file.data, {
    env: {
      dev: true,
    },
  });

  // Rename
  clone.path = file.path.replace(path.extname(file.path), `.dev${path.extname(file.path)}`);

  // Return array
  return [clone];
} : null,
```

This potentially speeds up CI builds (where the same templates are built with both a dev and prod config) since we only run the expensive task of setting up the data once.

The CI needs to take care of moving & renaming the `.prod.html` files.

#### plugins.sort

Type: `Function`<br>
Default: `null`

Example:
```js
// Prioritize the currently active page (as reported by BrowserSync)
sort: (file) => {
  const currentPath = parse(env.browserSync.currentUrl).pathname || '';
  const filePath = path.relative('./src', file.path).replace(path.extname(file.path), '');

  if (currentPath.includes(filePath)) {
    return -1;
  }

  return 1;
},
```

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
