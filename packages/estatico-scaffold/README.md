# @unic/estatico-scaffold

Uses [`node-plop`](https://github.com/amwmedia/node-plop) to interactively scaffold files.

## Installation

```
$ npm install --save-dev @unic/estatico-scaffold
```

To use `change-case` as described below:
```
$ npm install --save-dev change-case
```


## Usage

```js
const gulp = require('gulp');
const env = require('minimist')(process.argv.slice(2));

/**
 * Scaffolding task
 * Uses `node-plop` to interactively scaffold files.
 */
gulp.task('scaffold', () => {
  const task = require('@unic/estatico-scaffold');

  const instance = task({
    types: [
      {
        name: 'Module',
        src: './src/modules/.scaffold/*',
        dest: './src/modules/',
        transformInput : (answers) => {
          const changeCase = require('change-case'),
            name = answers.newName || answers.name;

          return Object.assign({}, answers, {
            [answers.newName ? 'newFileName' : 'fileName']: changeCase.snake(path.basename(name)),
            [answers.newName ? 'newClassName' : 'className']: changeCase.pascal(path.basename(name)),
            [answers.newName ? 'newModuleName' : 'moduleName']: changeCase.camel(path.basename(name)),
          });
        },
        modifications: (answers) => {
          const moduleName = answers.newModuleName || answers.moduleName;
          const className = answers.newClassName || answers.className;
          const fileName = answers.newFileName || answers.fileName;

          const isRemove = (answers.action === 'Remove');
          const hasJs = answers.files ? answers.files.find(file => file.match(/{{fileName}}\.js/)) : true;
          const hasCss = answers.files ? answers.files.find(file => file.match(/{{fileName}}\.scss/)) : true;

          switch (answers.action) {
            case 'Add':
            case 'Copy':
              return [].concat(hasJs ? [
                {
                  type: 'modify',
                  path: './src/assets/js/helpers/app.js',
                  pattern: /(\s+)(\/\* autoinsertmodule \*\/)/m,
                  template: `$1this.modules.${moduleName} = ${className};$1$2`,
                  abortOnFail: true,
                },
                {
                  type: 'modify',
                  path: './src/assets/js/helpers/app.js',
                  pattern: /(\s+)(\/\* autoinsertmodulereference \*\/)/m,
                  template: `$1import ${className} from '../../../modules/${fileName}/${fileName}';$1$2`,
                  abortOnFail: true,
                },
              ] : []).concat(hasCss ? [
                {
                  type: 'modify',
                  path: './src/assets/css/main.scss',
                  pattern: /(\s+)(\/\/\*autoinsertmodule\*)/m,
                  template: `$1@import "../../modules/${fileName}/${fileName}";$1$2`,
                  abortOnFail: true,
                },
              ] : []);
            case 'Rename':
            case 'Remove':
              return [].concat(hasJs ? [
                {
                  type: 'modify',
                  path: './src/assets/js/helpers/app.js',
                  pattern: new RegExp(`(\\s+)?this.modules.${answers.moduleName} = ${answers.className};`, 'm'),
                  template: isRemove ? '' : `$1this.modules.${moduleName} = ${className};`,
                  abortOnFail: true,
                },
                {
                  type: 'modify',
                  path: './src/assets/js/helpers/app.js',
                  pattern: new RegExp(`(\\s+)?import ${answers.className} from '../../../modules/${answers.fileName}/${answers.fileName}';`, 'm'),
                  template: isRemove ? '' : `$1import ${className} from '../../../modules/${fileName}/${fileName}';`,
                  abortOnFail: true,
                },
              ] : []).concat(hasCss ? [
                {
                  type: 'modify',
                  path: './src/assets/css/main.scss',
                  pattern: new RegExp(`(\\s+)?@import "../../modules/${answers.fileName}/${answers.fileName}";`, 'm'),
                  template: isRemove ? '' : `$1@import "../../modules/${fileName}/${fileName}";`,
                  abortOnFail: true,
                },
              ] : []);
            default:
              return [];
          }
        },
      },
      {
        name: 'Page',
        src: './src/pages/.scaffold/*',
        dest: './src/pages/',
        transformInput: (answers) => {
          const changeCase = require('change-case'),
            name = answers.newName || answers.name;

          return Object.assign({}, answers, {
            [answers.newName ? 'newFileName' : 'fileName']: changeCase.snake(path.basename(name)),
          });
        },
      },
    ],
  }, env);

  return instance();
});
```

Run task (assuming the project's `package.json` specifies `"scripts": { "gulp": "gulp" }`):
`$ npm run gulp scaffold`

See possible flags specified above.

## API

`plugin(options, env)` => `taskFn`

### options

#### types (required)

Type: `Array` of `type`s
Default: `null`

##### type.name (required)

Type: `String`<br>
Default: `null`

Used to interactively select type.

##### type.src (required)

Type: `String`<br>
Default: `null`

Glob of scaffold paths.

##### type.dest (required)

Type: `String`<br>
Default: `null`

Directory where the files will be scaffolded.

##### type.transformInput(answers)

Type: `Function`<br>
Default: `null`

Add name variants, e.g. See example above.

##### type.modifications(answers)

Type: `Function`<br>
Default: `null`

Array of [`modify` actions](https://plopjs.com/documentation/#modify). Used to register/unregister JS and CSS files, e.g.

##### type.getNameChoices()

Type: `Function`<br>
Default: `null`

Returning promise resolving to array of allowed names.

#### logger

Type: `{ info: Function, debug: Function, error: Function }`<br>
Default: Instance of [`estatico-utils`](../estatico-utils)'s `Logger` utility.

Set of logger utility functions used within the task.

### env

Type: `Object`<br>
Default: `{}`

Result from parsing CLI arguments via `minimist`, e.g. `{ dev: true }`.

## License

Apache 2.0.
