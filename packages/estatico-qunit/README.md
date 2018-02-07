# @unic/estatico-qunit [WIP]

Helpers for QUnit tests

## Installation

```
$ npm install --save-dev @unic/estatico-qunit
```

## Usage

Add the following config to the `estatico-puppeteer`'s options:
```js
{
  plugins: {
    interact: {
      interact: async (page) => {
        // Run tests
        const results = await require('@unic/estatico-qunit').puppeteer.run(page);

        // Report results
        if (results) {
          require('@unic/estatico-qunit').puppeteer.log(results);
        }
      },
    },
  },
};
```

Include test script in `src/preview/assets/js/main.js`, e.g.:
```js
import 'estatico-qunit/lib/browser';
```

Add the following config to the `estatico-handlebars`'s options:
```js
{
  plugins: {
    handlebars: {
      helpers: {
        register: () => {
          handlebars.registerHelper('qunit', estaticoQunit.handlebarsHelper(handlebars));
        },
      }
    },
  },
};
```

Include partial in `src/preview/partials/test.hbs`, e.g.:
```hbs
{{{qunit mainTestScript="/preview/assets/js/test.js" testScripts=meta.testScripts}}}
```

## License

Apache 2.0.
