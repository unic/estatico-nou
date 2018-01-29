const gulp = require('gulp');
const path = require('path');
const parseArgs = require('minimist');
const estaticoHandlebars = require('estatico-handlebars');
const estaticoHtmlValidate = require('estatico-w3c-validator');
const estaticoSass = require('estatico-sass');
const estaticoStylelint = require('estatico-stylelint');
const estaticoWebpack = require('estatico-webpack');
const estaticoWatch = require('estatico-watch');

const env = parseArgs(process.argv.slice(2));

// Exemplary custom config
const config = {
  html: {
    src: [
      './src/*.hbs',
      './src/pages/**/*.hbs',
      './src/demo/pages/**/*.hbs',
      './src/modules/**/!(_)*.hbs',
      './src/demo/modules/**/!(_)*.hbs',
      './src/preview/styleguide/*.hbs',
    ],
    srcBase: './src',
    srcPartials: [
      './src/layouts/*.hbs',
      './src/modules/**/*.hbs',
      './src/demo/modules/**/*.hbs',
      './src/preview/**/*.hbs',
    ],
    dest: './dist',
    watch: [
      './src/*.hbs',
      './src/pages/**/*.hbs',
      './src/demo/pages/**/*.hbs',
      './src/modules/**/!(_)*.hbs',
      './src/demo/modules/**/!(_)*.hbs',
      './src/preview/styleguide/*.hbs',
    ],
    watchDependencyGraph: {
      srcBase: './',
      resolver: {
        hbs: {
          match: /{{(?:>|#extend)[\s-]*["|']?([^"\s(]+).*?}}/g,
          resolve: (match /* , filePath */) => {
            if (!match[1]) {
              return null;
            }

            let resolvedPath = path.resolve('./src', match[1]);

            // Add extension
            resolvedPath = `${resolvedPath}.hbs`;

            return resolvedPath;
          },
        },
        js: {
          match: /require\('(.*?\.data\.js)'\)/g,
          resolve: (match, filePath) => {
            if (!match[1]) {
              return null;
            }

            return path.resolve(path.dirname(filePath), match[1]);
          },
        },
      },
    },
    plugins: {
      // Use JSON file instead of data.js
      data: file => require(file.path.replace(path.extname(file.path), '.json')), // eslint-disable-line global-require, import/no-dynamic-require
    },
  },
  htmlValidate: {
    src: [
      './dist/*.html',
      // './dist/modules/**/*.html',
      // './dist/pages/**/*.html',
    ],
    srcBase: './dist/',
    watch: [
      './dist/*.html',
      // './dist/modules/**/*.html',
      // './dist/pages/**/*.html',
    ],
  },
  css: {
    src: [
      './src/assets/css/**/*.scss',
    ],
    srcIncludes: [
      './src/',
    ],
    srcBase: './src/',
    dest: './dist',
    plugins: {
      clean: env.dev ? null : {},
    },
  },
  cssLint: {
    src: [
      './src/**/*.scss',
    ],
    srcBase: './src/',
    dest: './dist',
  },
  js: {
    entries: {
      main: './src/assets/js/main.js',
    },
    dest: path.resolve('./dist/assets/js'),
  },
  watch: null,
};

// Exemplary tasks
// Create named functions so gulp-cli can properly log them
const tasks = {
  html: function html(watcher) {
    return estaticoHandlebars(config.html, watcher);
  },
  htmlValidate: function htmlValidate() {
    return estaticoHtmlValidate(config.htmlValidate);
  },
  css: function css() {
    return estaticoSass(config.css);
  },
  cssLint: function cssLint() {
    return estaticoStylelint(config.cssLint);
  },
  js: function js(cb) {
    return estaticoWebpack(config.js, cb);
  },
};

tasks.watch = () => {
  Object.keys(tasks).forEach((task) => {
    if (!(config[task] && config[task].watch)) {
      return;
    }

    estaticoWatch({
      task: tasks[task],
      src: config[task].watch,
      once: config[task].watchOnce,
      watcher: config[task].watcher,
      dependencyGraph: config[task].watchDependencyGraph,
    });
  });
};

// Register with gulp
Object.keys(tasks).forEach((task) => {
  gulp.task(task, tasks[task]);
});

gulp.task('default', gulp.series(gulp.parallel(tasks.html, tasks.css), gulp.parallel(tasks.htmlValidate, tasks.cssLint)), tasks.watch);
