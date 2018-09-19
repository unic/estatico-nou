# Estático Nou

Refactored https://github.com/unic/estatico with separate packages for every task. Mono-repo based on [Lerna](https://github.com/lerna/lerna).

## What is this?

Estático is basically a set of (mostly) [`gulp.js`](https://gulpjs.com/) tasks to build a static frontend. At [Unic](https://www.unic.com/) we use it to develop frontend prototypes / pattern libraries.

The goal is to provide a thin wrapper on top of de-facto-standards like [`webpack`](https://webpack.js.org/), [`Babel`](https://babeljs.io/), [`Sass`](https://sass-lang.com/), [`ESLint`](https://eslint.org/) or [`stylelint`](https://stylelint.io/), to name the most important ones. 

As you can see in our [boilerplate](packages/estatico-boilerplate), we rely on the default configuration files for aforementioned tools, which should make your code very portable. Specifically, you could decide on using `webpack` without our wrapper task and would still get the same result. However, using the tasks will give you the following advantages:
- Sensible and battle-tested defaults for tools like `webpack` and `Sass`.
- "Smart" file watching based on a dependency graph of your code. This makes sure that editing a Sass or Handlebars partial will only rebuild the necessary files.
- Extended logging, making use of gulp's [`loglevel`](https://github.com/gulpjs/gulp-cli) flag. So running a task with `-LLLL` will give you more detailed infos than with `-L`.
- Config validation using [`joi`](https://www.npmjs.com/package/joi), trying to make sure that you know *why* a task might be failing instead of just throwing an exception.

## When could I use this?

It very much depends on what you are creating. We often build rather static frontend prototypes containing only small application parts. There, a setup based on Gulp task has proven to be very helpful and flexible.

If the asset pipeline part isn't that important, a static site generator like [`11ty`](https://github.com/11ty/eleventy) might be a better fit. It is also possible to combine Estático with tools like [`Fractal`](https://fractal.build/), which would take care of the  templating and component previewing part.

For a JavaScript application we would rather recommend using the corresponding tools like [`Vue CLI`](https://cli.vuejs.org/), [`Create React App`](https://github.com/facebook/create-react-app) or [`Angular CLI`](https://cli.angular.io/). 

## How can I use it?

The tasks and helpers are npm packages published in our [`@unic` scope](https://www.npmjs.com/org/unic). The READMEs explaining how to install and use them are both available on npmjs.com and in the corresponding directories of this repo (see links above).

The [estatico-boilerplate](packages/estatico-boilerplate) package is meant as a demo project / boilerplate. Therefore it is *not* available on npm but rather needs to be cloned locally (see [instructions](packages/estatico-boilerplate) on how to do this).

## What does it contain?

- [estatico-boilerplate](packages/estatico-boilerplate) (see notes above)

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
- [estatico-jest](packages/estatico-jest)
- [estatico-qunit](packages/estatico-qunit) [deprecated]
- [estatico-utils](packages/estatico-utils)

## How can I contribute?

- Clone this repository
- Install lerna globally: `npm i -g lerna`
- Bootstrap (installing dependencies and linking them): `lerna bootstrap` 

If bootstrapping fails, reducing the concurrency might help: `lerna bootstrap --concurrency=1`

Every package in `packages/` can be developed separately.

### Manage npm dependencies

Since lerna does magic things with packages (symlinking local ones etc.), we need to use `lerna add` to add new dependencies to a package. Examples: `lerna add node-sass --scope=@unic/estatico-sass` or `lerna add left-pad --dev --scope=@unic/estatico-boilerplate`.

To remove dependencies, delete them from the corresponding `package.json`.

Run `lerna bootstrap` after any change (either adding or removing).

### Boilerplate

As described above, the `estatico-boilerplate` package is meant as a demo project. I has the main packages specified as dependencies and Lerna takes care of linking them locally. So a change to `estatico-stylelint` will immediately be available in `estatico-boilerplate`. This is very useful when working on task packages since the corresponding changes can immediately be tested in the boilerplate.

### Tests

To run all tests in every package we can call `lerna exec -- npm test`. For a specific one we can use `lerna exec --scope=@unic/estatico-stylelint -- npm test` (or `npm run lerna-test` after navigating into a package).

### Release

[`lerna publish --exact`](https://github.com/lerna/lerna#publish) and lots of magic.
