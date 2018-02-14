# @unic/estatico-scaffold

Uses [`node-plop`](https://github.com/amwmedia/node-plop) to interactively scaffold files.

## Installation

```
$ npm install --save-dev @unic/estatico-scaffold
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
        dist: './src/modules/',
        transformName: (name) => {
          const changeCase = require('change-case');

          return {
            fileName: changeCase.snake(path.basename(name)),
            className: changeCase.pascal(path.basename(name)),
            moduleName: changeCase.camel(path.basename(name)),
          };
        },
        modifications: (answers) => {
          const moduleName = answers.newModuleName || answers.moduleName;
          const className = answers.newClassName || answers.className;
          const fileName = answers.newFileName || answers.fileName;

          const isRemove = (answers.action === 'Remove');
          const hasJs = answers.files.find(file => file.match(/{{fileName}}\.js/));
          const hasCss = answers.files.find(file => file.match(/{{fileName}}\.scss/));

          switch (answers.action) {
            case 'Add':
            case 'Copy':
              return [].concat(hasJs ? [
                {
                  type: 'modify',
                  path: './src/assets/js/helpers/estaticoapp.js',
                  pattern: /(\s+)(\/\* autoinsertmodule \*\/)/m,
                  template: `$1this.modules.${moduleName} = ${className};$1$2`,
                  abortOnFail: true,
                },
                {
                  type: 'modify',
                  path: './src/assets/js/helpers/estaticoapp.js',
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
              return [
                {
                  type: 'modify',
                  path: './src/assets/js/helpers/estaticoapp.js',
                  pattern: new RegExp(`(\\s+)?this.modules.${answers.moduleName} = ${answers.className};`, 'm'),
                  template: isRemove ? '' : `$1this.modules.${answers.newModuleName} = ${answers.newClassName};$1`,
                  abortOnFail: true,
                },
                {
                  type: 'modify',
                  path: './src/assets/js/helpers/estaticoapp.js',
                  pattern: new RegExp(`(\\s+)?import ${answers.className} from '../../../modules/${answers.fileName}/${answers.fileName}';`, 'm'),
                  template: isRemove ? '' : `$1import ${answers.newClassName} from '../../../modules/${answers.newFileName}/${answers.newFileName}';$1`,
                  abortOnFail: true,
                },
                {
                  type: 'modify',
                  path: './src/assets/css/main.scss',
                  pattern: new RegExp(`(\\s+)?@import "../../modules/${answers.fileName}/${answers.fileName}";`, 'm'),
                  template: isRemove ? '' : `$1@import "../../modules/${answers.newFileName}/${answers.newFileName}";$1`,
                  abortOnFail: true,
                },
              ];
            default:
              return [];
          }
        },
      },
      {
        name: 'Page',
        src: './src/pages/.scaffold/*',
        dist: './src/pages/',
        transformName: (name) => {
          const changeCase = require('change-case');

          return {
            fileName: changeCase.snake(path.basename(name)),
          };
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

##### type.dist (required)

Type: `String`<br>
Default: `null`

Directory where the files will be scaffolded.

##### type.transformName(name)

Type: `Function`<br>
Default: `null`

Name variants to be added to answers. See example above.

##### type.modifications(answers)

Type: `Function`<br>
Default: `null`

Array of [`modify` actions](https://plopjs.com/documentation/#modify). Used to register/unregister JS and CSS files, e.g.

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
