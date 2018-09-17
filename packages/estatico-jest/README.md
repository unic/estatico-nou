# @unic/estatico-jest

Puppeteer environment for Jest tests.

## Installation

```
$ npm install --save-dev jest @unic/estatico-jest
```

## Usage

Recommendation: Add `jest` as npm script:
```json
"scripts": {
    "jest": "jest"
}
```

Create `jest.config.js`:
```js
const path = require('path');

const dir = path.dirname(require.resolve('@unic/estatico-jest'));

module.exports = {
  globalSetup: path.join(dir, './setup.js'),
  globalTeardown: path.join(dir, './teardown.js'),
  testEnvironment: path.join(dir, './environment.js'),
  testRegex: 'src/.*\\.test\\.js$',
  // This seems to be the only way for now to pass options to setup.js
  // https://github.com/facebook/jest/issues/5957#issuecomment-422027349
  projects: [{
    // We temporarily run a static webserver where Puppeteer can access our HTML
    puppeteerServer: {
      port: 3000,
      dir: './dist',
    },
  }],
};
```

Add test files to repository (their file name needs to match the `testRegex` above).

### Example test

```js
describe('Slideshow Tests', () => {
  let page;

  beforeAll(async () => {
    const url = `http://localhost:${global.__STATIC_PORT__}/demo/modules/slideshow/slideshow.html`;

    page = await global.__BROWSER__.newPage();

    page.on('pageerror', console.log);

    await page.goto(url, {
      waitUntil: ['networkidle2']
    });
  });

  afterEach(async () => {
    await page.reload();
  });

  afterAll(async () => {
    await page.close();
  });

  it('should load without error', async () => {
    const text = await page.evaluate(() => document.body.textContent);

    expect(text).toContain('Slideshow');
  });

  it('should return initial image source', async () => {
    const src = await page.evaluate(async () => {
      const img = document.querySelector('[data-slideshow="slide"] img');

      return img.src;
    });

    expect(src).toBe('http://www.fillmurray.com/600/201');
  });

  it('should change the active slide on "next" button click', async () => {
    const currentItem = await page.evaluate(async () => {
      const button = document.querySelector('[data-slideshow="next"]');
      const uuid = document.querySelector('[data-init="slideshow"]').dataset.slideshowInstance;

      await button.click();

      return window.estatico.modules.slideshow.instances[uuid].currentItem;
    });

    expect(currentItem).toBe(1);
  });
});
```

## License

Apache 2.0.
