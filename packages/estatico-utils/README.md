# @unic/estatico-utils [WIP]

Utilities for logging etc.

## Installation

```
$ npm install --save-dev @unic/estatico-utils
```

## Usage

### Logger

```js
const parseArgs = require('minimist');
const { Logger } = require('@unic/estatico-utils');

const env = parseArgs(process.argv.slice(2));

// Create instance of logger for specific plugin
const logger = new Logger('estatico-bla');

// Log info
logger.info('Step X', 'Something is happening');

// Log debug info, only logged if "NODE_DEBUG=estatico-bla" is set
// See https://nodejs.org/api/util.html#util_util_debuglog_section
logger.debug('Step X', 'Something is happening');

// Log "extended" debug info, only logged if "NODE_DEBUG=estatico-bla-extended" is set
logger.debug('Step X', 'Something is happening', { /* Additional log info */ });

// Log error, will exit process unless env.dev is true
logger.error('Step X', new Error('Something went wrong'), env.dev);
```

### Plugin

```js
const { Plugin } = require('@unic/estatico-utils');

// Set up details, schema and task
// …

module.exports = (options, env = {}) => new Plugin({
  defaults,
  schema,
  options,
  task,
  env,
});
```


### Test

#### compareFiles(t, fileGlob)

Compares files resolved from `fileGlob` with current files in `results/` directory.

```js
const test = require('ava');
const utils = require('@unic/estatico-utils').test;

test.cb('default', (t) => {
  task(defaults)().on('end', () => utils.compareFiles(t, path.join(__dirname, 'expected/default/*')));
});
```

#### stripLogs(sinonSpy)

Join everything `sinon.spy` captured into string, strip ANSI characters and line-breaks.

```js
const test = require('ava');
const sinon = require('sinon');
const utils = require('@unic/estatico-utils').test;

test.cb('error', (t) => {
  const spy = sinon.spy(console, 'log');

  task(defaults)().on('end', () => {
    spy.restore();

    const log = utils.stripLogs(spy);

    t.regex(log, /test\/fixtures\/error.hbs Parse error on line 2/);

    t.end();
  });
});
```

## License

Apache 2.0.
