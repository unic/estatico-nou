const gulp = require('gulp');
const path = require('path');
const parseArgs = require('minimist');
const estaticoHandlebars = require('estatico-handlebars');
const estaticoHtmlValidate = require('estatico-w3c-validator');
const estaticoSass = require('estatico-sass');
const estaticoStylelint = require('estatico-stylelint');
const estaticoWatch = require('estatico-watch');

const env = parseArgs(process.argv.slice(2));

// Exemplary custom config
const config = {
  handlebars: {
    src: [
      './src/*.hbs',
      './src/pages/**/*.hbs',
      './src/demo/pages/**/*.hbs',
      './src/modules/**/!(_)*.hbs',
      './src/demo/modules/**/!(_)*.hbs',
      './src/preview/styleguide/*.hbs',
    ],
    srcBase: './src',
    dest: './dist',
    watch: [
      './src/*.hbs',
      './src/pages/**/*.hbs',
      './src/demo/pages/**/*.hbs',
      './src/modules/**/!(_)*.hbs',
      './src/demo/modules/**/!(_)*.hbs',
      './src/preview/styleguide/*.hbs',
    ],
    plugins: {
      handlebars: {
        partials: [
          './src/layouts/*.hbs',
          './src/modules/**/*.hbs',
          './src/demo/modules/**/*.hbs',
          './src/preview/**/*.hbs',
        ],
      },
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
  sass: {
    src: [
      './src/assets/css/**/*.scss',
    ],
    srcBase: './src/',
    dest: './dist',
    plugins: {
      sass: {
        includePaths: [
          './src/',
        ],
      },
      clean: env.dev ? null : {},
    },
  },
  stylelint: {
    src: [
      './src/**/*.scss',
    ],
    srcBase: './src/',
    dest: './dist',
  },
  watch: null,
};

// Exemplary tasks
// Create named functions so gulp-cli can properly log them
const tasks = {
  handlebars: function handlebars() {
    return estaticoHandlebars(config.handlebars);
  },
  htmlValidate: function htmlValidate() {
    return estaticoHtmlValidate(config.htmlValidate);
  },
  sass: function sass() {
    return estaticoSass(config.sass);
  },
  stylelint: function stylelint() {
    return estaticoStylelint(config.stylelint);
  },
};

// Register with gulp
Object.keys(tasks).forEach((task) => {
  gulp.task(task, tasks[task]);
});

gulp.task('default', gulp.series(gulp.parallel(tasks.handlebars, tasks.sass), gulp.parallel(tasks.htmlValidate, tasks.stylelint)));

gulp.task('watch', () => {
  Object.keys(tasks).forEach((task) => {
    if (!config[task].watch) {
      return;
    }

    estaticoWatch({
      task: tasks[task],
      src: config[task].watch,
      once: config[task].watchOnce,
      watcher: config[task].watcher,
    });
  });
});
