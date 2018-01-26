# estatico-webpack

Bundles JavaScript, transpiles via [`babel`](https://www.npmjs.com/package/babel).

## Installation

```
$ npm i -S estatico-webpack
```

## Usage

```js
const gulp = require('gulp');
const webpackTask = require('estatico-webpack');
const webpackOptions = {}; // Custom options, deep-merged into defaults via _.merge

gulp.task('js', () => sassTask(webpackOptions));
```

### Options

#### entries

Type: `Object`<br>
Default: `null`

Webpack `entry`.

Recommendation for Estático:
```js
{
  main: './src/assets/js/main.js',
}
```

#### dest

Type: `String`<br>
Default: `null`

Output directory.

Recommendation for Estático: `path.resolve('./dist/assets/js')`

#### errorHandler

Type: `Function`<br>
Default:
```js
(err) => {
  util.log(`estatico-webpack${err.plugin ? ` (${err.plugin})` : null}`, util.colors.cyan(err.fileName), util.colors.red(err.message));
}
```

Function to run if an error occurs in one of the steps.

#### plugins

Type: `Object`

##### plugins.uglify

Type: `Object`<br>
Default: `{}`

Recommendation for Estático: 
```js
{
  
}
```

Passed to [`UglifyjsWebpackPlugin`](https://webpack.js.org/plugins/uglifyjs-webpack-plugin/).

## License

Apache 2.0.
