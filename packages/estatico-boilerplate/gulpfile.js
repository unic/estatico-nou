const gulp = require('gulp');
const path = require('path');
const parseArgs = require('minimist');
const estaticoHandlebars = require('estatico-handlebars');
const estaticoHtmlValidate = require('estatico-w3c-validator');
const estaticoSass = require('estatico-sass');
const estaticoStylelint = require('estatico-stylelint');
const estaticoWebpack = require('estatico-webpack');
const estaticoWatch = require('estatico-watch');
const jsonImporter = require('node-sass-json-importer');

const env = parseArgs(process.argv.slice(2));

// Exemplary custom config
const config = {
  html: {
    src: [
      './src/*.hbs',
      './src/pages/**/*.hbs',
      './src/demo/pages/**/*.hbs',
      '!./src/demo/pages/handlebars/*.hbs',
      './src/modules/**/!(_)*.hbs',
      './src/demo/modules/**/!(_)*.hbs',
      './src/preview/styleguide/*.hbs',
      '!./src/preview/styleguide/colors.hbs',
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
        partials: './src/**/*.hbs',
      },
    },
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
    srcBase: './src/',
    dest: './dist',
    plugins: {
      sass: {
        includePaths: [
          './src/',
        ],
        importer: [jsonImporter],
      },
      clean: env.dev ? null : {},
      rename: env.dev ? null : file => file.path.replace(path.extname(file.path), ext => `.min${ext}`),
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
  html: estaticoHandlebars(config.html, env.dev),
  htmlValidate: estaticoHtmlValidate(config.htmlValidate, env.dev),
  css: estaticoSass(config.css, env.dev),
  cssLint: estaticoStylelint(config.cssLint, env.dev),
  js: estaticoWebpack(config.js, env.dev),
};

tasks.watch = () => {
  Object.keys(tasks).forEach((task) => {
    if (!(config[task] && config[task].watch)) {
      return;
    }

    const watcher = estaticoWatch({
      task: tasks[task],
      name: task,
      src: config[task].watch,
      once: config[task].watchOnce,
      watcher: config[task].watcher,
      dependencyGraph: config[task].watchDependencyGraph,
    });

    watcher();
  });
};

// Register with gulp
Object.keys(tasks).forEach((task) => {
  gulp.task(task, tasks[task]);
});

gulp.task('default', gulp.series(gulp.parallel('html', 'css'), gulp.parallel('htmlValidate', 'cssLint')), 'watch');
