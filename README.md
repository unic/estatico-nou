# Estático Nou

Refactored Estático with separate packages for every task. Mono-repo based on [Lerna](https://github.com/lerna/lerna).

## Packages

- [estatico-boilerplate](packages/estatico-boilerplate)

### Tasks

- [estatico-browsersync](packages/estatico-browsersync)
- [estatico-copy](packages/estatico-copy)
- [estatico-eslint](packages/estatico-eslint)
- [estatico-font-datauri](packages/estatico-font-datauri)
- [estatico-handlebars](packages/estatico-handlebars)
- [estatico-imageversions](packages/estatico-imageversions)
- [estatico-json-mocks](packages/estatico-json-mocks)
- [estatico-puppeteer](packages/estatico-puppeteer)
- [estatico-sass](packages/estatico-sass)
- [estatico-scaffold](packages/estatico-scaffold)
- [estatico-stylelint](packages/estatico-stylelint)
- [estatico-svgsprite](packages/estatico-svgsprite)
- [estatico-w3c-validator](packages/estatico-w3c-validator)
- [estatico-watch](packages/estatico-watch)
- [estatico-webpack](packages/estatico-webpack)

### Helpers

- [estatico-data](packages/estatico-data)
- [estatico-qunit](packages/estatico-qunit)
- [estatico-utils](packages/estatico-utils)

## Setup & Usage

- Install lerna globally: `npm i -g lerna`
- Bootstrap (installing dependencies and linking them): `lerna bootstrap` 

If bootstrapping fails, reducing the concurrency might help: `lerna bootstrap --concurrency=1`

Every package in `packages/` can be developed separately.

### Manage npm dependencies

Since lerna does magic things with packages (symlinking local ones etc.), we need to use `lerna add` to add new dependencies to a package. Examples: `lerna add node-sass --scope=@unic/estatico-sass` or `lerna add left-pad --dev --scope=@unic/estatico-boilerplate`.

To remove dependencies, delete them from the corresponding `package.json`.

Run `lerna bootstrap` after any change (either adding or removing).

### Boilerplate

The `estatico-boilerplate` package is meant as a demo project. I has the main packages specified as dependencies and Lerna takes care of linking them locally. So a change to `estatico-stylelint` will immediately be available in `estatico-boilerplate`.

In the boilerplate, existing gulp tasks (see [gulpfile.js](packages/estatico-boilerplate/gulpfile.js)) can be triggered via `npm run gulp [taskName]`, e.g. `npm run gulp js`.

### Tests

To run all tests in every package we can call `lerna exec -- npm test`. For a specific one we can use `lerna exec --scope=@unic/estatico-stylelint -- npm test` (or `npm run lerna-test` after navigating into a package).

### Release

[`lerna publish --exact`](https://github.com/lerna/lerna#publish) and lots of magic.
