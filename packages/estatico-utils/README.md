# estatico-utils [WIP]

Utilities for logging etc.

## Installation

```
$ npm install --save-dev estatico-utils
```

## Usage

### Logger

```js
const parseArgs = require('minimist');
const { Logger } = require('estatico-utils');

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

### Test

```js
const { test } = require('estatico-utils');

test.bla();
```

## License

Apache 2.0.
