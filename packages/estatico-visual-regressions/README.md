# @unic/estatico-visual-regressions

Helper for visual regression tests with [estatico-puppeteer](../estatico-puppeteer). Uses [pixelmatch](https://github.com/mapbox/pixelmatch).

## Installation

```
$ npm install --save-dev @unic/estatico-visual-regressions @unic/estatico-puppeteer
```

## Usage

TODO: Add example without `estatico-puppeteer`, using puppeteer directly.

Add the following config to the `estatico-puppeteer`'s options:
```js
{
  plugins: {
    interact: async (page, taskConfig) => {
      // Run tests
      const results = await visualRegressions(page, {
        dest: './test/results/screenshots',
        destDiff: './test/results/diff',
        srcReferences: './test/fixtures/references',
        viewports: taskConfig.viewports,
        getTargets: async (pageInstance) => {
          const targets = await pageInstance.$$('.demo');

          return targets;
        },
      });

      // Report results
      visualRegressions.log(results, console);
    },
  },
};
```

## License

Apache 2.0.
