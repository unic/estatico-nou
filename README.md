# Test repo to extract and maintain task in separates packages via [Lerna](https://github.com/lerna/lerna)

## Recommended setup

- Install lerna globally: `npm i -g lerna`
- Bootstrap (installing dependencies and linking them): `lerna bootstrap` 

## Usage

Every package in `packages/` can be developed separately. However, they can share common `devDependencies`, e.g.. This allows us to specify test dependencies like `ava` only once in the root of the project and use it for every package.

### Manage npm dependencies

Since lerna does magic things with packages (symlinking local ones etc.), we need to use `lerna add` to add new dependencies to a package. Examples: `lerna add node-sass --scope=@unic/estatico-sass` or `lerna add left-pad --dev --scope=@unic/estatico-boilerplate`.

To remove dependencies, delete them from the corresponding `package.json`.

Run `lerna bootstrap` after any change (either adding or removing).

### Boilerplate

The `estatico-boilerplate` package is meant as a demo project. I has the main packages specified as dependencies and Lerna links them locally. So a change to `estatico-stylelint` will immediately be available in `estatico-boilerplate`.

In the boilerplate, existing gulp tasks (see [gulpfile.js](packages/estatico-boilerplate/gulpfile.js)) can be triggered via `npm run gulp [taskName]`, e.g. `npm run gulp js`.

### Tests

To run all tests in every package we can call `lerna exec -- npm test`. For a specific one we can use `lerna exec --scope=@unic/estatico-stylelint -- npm test`.
