# @unic/estatico-jest

Puppeteer environment for Jest tests.

## Installation

```
$ npm install --save-dev jest @unic/estatico-jest
```

## Usage

1. Create `jest.config.js`:
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
        puppeteer: {
          // Our current Teamcity agents expect Puppeteer to run in no-sandbox mode
          args: env.ci ? ['--no-sandbox'] : [],
        },
      },
    }],
  };
  ```

2. Recommendation: Add `jest` as npm script:
  ```json
  "scripts": {
      "jest": "jest"
  }
  ```

3. Optional: Set up Gulp task (requires `strip-ansi` package):
  ```js
  /**
   * JavaScript testing task
   * Uses Jest with Puppeteer to check for JS errors and run tests
   * Expects an npm script called "jest" which is running jest
   *
   * An alternative would be to use jest.runCLI instead. However, this currently fails
   * due to the teardown script terminating the process in order to close the static webserver.
   *
   * Instead of running this task it is possible to just execute `npm run jest`
   */
  gulp.task('js:test', (done) => { // eslint-disable-line consistent-return
    // Skip task when skipping tests
    if (env.skipTests) {
      return done();
    }

    const { spawn } = require('child_process');
    const stripAnsi = require('strip-ansi');

    let failed = false;
    let killed = false;
    let teardownFailed = false;

    const tests = spawn('npm', ['run', 'jest'].concat(env.ci ? ['--', '--ci'] : []), {
      // Add proper output coloring unless in CI env (where this would have weird side-effects)
      stdio: env.ci ? 'pipe' : ['inherit', 'inherit', 'pipe'],
    });

    tests.stderr.on('data', (data) => {
      if (stripAnsi(`${data}`).match(/(Test Suites: (.*?) failed|npm ERR!)/m)) {
        failed = true;
      }

      // Don't treat as failure: Travis seems to kill the whole process for whatever reason
      if (stripAnsi(`${data}`).match(/Killed/m)) {
        killed = true;
      }

      // Don't treat as failure: The web server might have stopped or the process could not be found
      if (stripAnsi(`${data}`).match(/No process found on port/m)) {
        teardownFailed = true;
      }

      process.stderr.write(data);
    });

    tests.on('close', () => {
      if (failed && !env.dev && !killed && !teardownFailed) {
        process.exit(1);
      }

      done();
    });
  });
  ```

4. Add test files to repository (their file name needs to match the `testRegex` above).

5. Recommended: Add `eslint-plugin-jest` with `jest/globals` to `.eslintrc.js`.

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
