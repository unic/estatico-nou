# Demo repo evaluate Lerna

## Recommended setup

- Install lerna globally: `npm i -g lerna`
- Bootstrap (installing dependencies and linking them): `lerna bootstrap` 

## Usage

Every package in `packages/` can be developed separately. However, they can share common `devDependencies`, e.g.. This allows us to specify test dependencies like `ava` only once in the root of the project and use it for every package.

To run all tests in every package we can call `lerna run test`. For a specific one we can use `lerna exec --scope estatico-stylelint -- npm run test`.

The `estatico-core` package is meant as a demo project. I has the main packages specified as dependencies and Lerna links them locally. So a change to `estatico-stylelint` will immediately be available in `estatico-core`.
