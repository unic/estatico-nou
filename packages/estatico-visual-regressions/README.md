# @unic/estatico-visual-regressions

Helper for visual regression tests with [estatico-puppeteer](../estatico-puppeteer). Uses [pixelmatch](https://github.com/mapbox/pixelmatch).

## Installation

```
$ npm install --save-dev @unic/estatico-visual-regressions
```

## Usage

### With Puppeteer

```
$ npm install --save-dev puppeteer
```

```js
const puppeteer = require('puppeteer');
const visualRegressions = require('@unic/estatico-visual-regressions');

puppeteer.launch().then(async (browser) => {
  const page = await browser.newPage();

  await page.goto('http://...');
  // await page.goto('file://...');

  const results = await visualRegressions(page, {
    // Options
  });

  console.log(results);

  await browser.close();
})
```

### With @unic/estatico-puppeteer

Add the following config to [`estatico-puppeteer`](../estatico-puppeteer)'s options:
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

## API

`visualRegressions(page, options)` => `[{...}, {...}]`

### page

Instance of Puppeteer's [Page Class](https://github.com/GoogleChrome/puppeteer/blob/v1.4.0/docs/api.md#class-page)

### options

#### dest

Type: `String`<br>
Default: `'./screenshots/results'`

Directory to save screenshots. Created if missing.

#### destDiff

Type: `String`<br>
Default: `'./screenshots/diff'`

Directory to save combined images of screenshot, diff and expected result. Created if missing.

#### srcReferences

Type: `String`<br>
Default: `'./screenshots/references'`

Directory where reference screenshots are located. If thetre are no reference images, they are created on the first run.

#### getTargets

Type: `Function`<br>
Default: `page => [page],`

Returns array of elements (or promises resolving to an element) to take screenshots from. Defaults to whole page. See more complex examples in [`tests`](./tests/index.js).

#### getFileName

Type: `Function`<br>
Default:
```js
(url, viewport, targetIndex) => {
  let fileName = path.basename(url, path.extname(url));

  // Append viewport name
  fileName = `${fileName}-${viewport}`;

  // Optionally append target index (in case of multiple targets per page)
  // eslint-disable-next-line no-restricted-globals
  fileName = `${fileName}${!isNaN(parseFloat(targetIndex)) ? `-${targetIndex}` : ''}`;

  return fileName;
}
```

Returns screenshot file name.

#### getTargets

Type: `Object`<br>
Default: `null`

Optional object of `viewportName:{width:Number}` pairs. Used for screenshot naming if present (see `getFileName` above).

#### pixelmatch

Type: `Object`<br>
Default:
```js
{
  threshold: 0.5,
}
```

Options passed to pixelmatch, see https://github.com/mapbox/pixelmatch

#### threshold

Type: `Number`<br>
Default: `50`

Threshold to treat differences as errors. Checks result from https://github.com/mapbox/pixelmatch

## License

Apache 2.0.
