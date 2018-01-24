const gulp = require('gulp');
const path = require('path');
const estaticoHandlebars = require('estatico-handlebars')
const estaticoHtmlValidate = require('estatico-html-validate')
const estaticoWatch = require('estatico-watch');

// Exemplary custom config
const config = {
  handlebars: {
    plugins: {
      // Use JSON file instead of data.js
      data: file => require(file.path.replace(path.extname(file.path), '.json')), // eslint-disable-line global-require, import/no-dynamic-require
    },
  },
  validateHtml: {
    src: './dist/*.html', // Skip module build, test index only
  },
  watch: null,
};

// Exemplary tasks
const tasks = {
  // Create named functions so gulp-cli can properly log them
  handlebars: estaticoHandlebars(config.handlebars),
  validateHtml: estaticoHtmlValidate(config.validateHtml),
};

gulp.task('default', gulp.series(tasks.handlebars.fn, tasks.validateHtml.fn));

gulp.task('watch', () => {
  Object.keys(tasks).forEach((task) => {
    const watchTask = estaticoWatch({
      src: tasks[task].config.watch,
      fn: tasks[task].fn
    }, gulp);

    try {
      watchTask.fn();
    } catch (err) {
      // TODO: "Beautify" error handling
      console.log(err)
    }
  });
});
