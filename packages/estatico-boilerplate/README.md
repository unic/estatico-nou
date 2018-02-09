# @unic/estatico-boilerplate [WIP]

Demo repo based on old Estático. Tasks were completely replaced with new ones and the source files were adapted where necessary.

## Installation

```
$ git clone https://github.com/unic/estatico-nou.git
$ cd estatico-nou
$ git filter-branch --subdirectory-filter packages/estatico-boilerplate
$ nvm use
$ npm i
```

## Usage

- Run default task, building everything and starting web server: `$ npm run gulp -- --dev --watch`
- Run specific task: `$ npm run html -- --dev`

See `gulpfile.js` for details.

## License

Apache 2.0.
