const gulp = require('gulp');
const path = require('path');
const estaticoHandlebars = require('estatico-handlebars');
const estaticoHtmlValidate = require('estatico-html-validate');
// const estaticoWatch = require('estatico-watch');

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
  validateHtml: {
    src: [
      './dist/*.html',
      // './dist/modules/**/*.html',
      // './dist/pages/**/*.html',
    ],
    srcBase: './dist/',
  },
  watch: null,
};

// Exemplary tasks
const tasks = {
  // Create named functions so gulp-cli can properly log them
  handlebars: function handlebars() {
    return estaticoHandlebars(config.handlebars);
  },
  validateHtml: function validateHtml() {
    return estaticoHtmlValidate(config.validateHtml);
  },
};

gulp.task('default', gulp.series(tasks.handlebars, tasks.validateHtml));

// gulp.task('watch', () => {
//   Object.keys(tasks).forEach((task) => {
//     const watchTask = estaticoWatch({
//       src: tasks[task].config.watch,
//       fn: tasks[task].fn,
//     }, gulp);

//     try {
//       watchTask.fn();
//     } catch (err) {
//       // TODO: "Beautify" error handling
//       console.log(err);
//     }
//   });
// });
