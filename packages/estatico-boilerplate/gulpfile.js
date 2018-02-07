const gulp = require('gulp');
const path = require('path');
const fs = require('fs');
const parseArgs = require('minimist');
const merge = require('lodash.merge');
const estaticoHandlebars = require('estatico-handlebars');
const estaticoHtmlValidate = require('estatico-w3c-validator');
const estaticoSass = require('estatico-sass');
const estaticoStylelint = require('estatico-stylelint');
const estaticoWebpack = require('estatico-webpack');
const estaticoWatch = require('estatico-watch');
const estaticoPuppeteer = require('estatico-puppeteer');
const estaticoQunit = require('estatico-qunit');
const estaticoSvgsprite = require('estatico-svgsprite');
const estaticoEslint = require('estatico-eslint');
const jsonImporter = require('node-sass-json-importer');
const del = require('del');

const env = parseArgs(process.argv.slice(2));
const moduleTemplate = fs.readFileSync('./src/preview/layouts/module.hbs', 'utf8');

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
    plugins: {
      handlebars: {
        partials: [
          './src/**/*.hbs',
          './node_modules/estatico-qunit/**/*.hbs',
        ],
        helpers: {
          register: (handlebars) => {
            handlebars.registerHelper('qunit', estaticoQunit.handlebarsHelper(handlebars));
          },
        },
      },
      transformBefore: (file) => {
        if (file.path.match(/(\\|\/)modules(\\|\/)/)) {
          return Buffer.from(moduleTemplate);
        }

        return file.contents;
      },
      // Relativify absolute paths
      transformAfter: (file) => {
        let content = file.contents.toString();
        let relPathPrefix = path.join(path.relative(file.path, './src'));

        relPathPrefix = relPathPrefix
          .replace(new RegExp(`\\${path.sep}g`), '/') // Normalize path separator
          .replace(/\.\.$/, ''); // Remove trailing ..

        content = content.replace(/('|")\/(?!\^)/g, `$1${relPathPrefix}`);

        content = Buffer.from(content);

        return content;
      },
    },
    watch: {
      src: [
        './src/**/*.hbs',
      ],
      dependencyGraph: {
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
  },
  htmlValidate: {
    src: [
      './dist/*.html',
      './dist/modules/**/*.html',
      './dist/pages/**/*.html',
    ],
    srcBase: './dist/',
    watch: {
      src: [
        './dist/*.html',
        './dist/modules/**/*.html',
        './dist/pages/**/*.html',
      ],
    },
  },
  css: {
    src: [
      './src/assets/css/**/*.scss',
      './src/preview/assets/css/**/*.scss',
    ],
    srcBase: './src/',
    dest: './dist',
    plugins: {
      sass: {
        includePaths: [
          './src/',
          './src/assets/css/',
        ],
        importer: [jsonImporter],
      },
    },
  },
  cssLint: {
    src: [
      './src/**/*.scss',
    ],
    srcBase: './src/',
    dest: './dist',
  },
  js: defaults => ({
    webpack: [
      merge({}, defaults.webpack, {
        entry: Object.assign({
          head: './src/assets/js/head.js',
          main: './src/assets/js/main.js',
        }, env.dev ? {
          dev: './src/assets/js/dev.js',
        } : {}),
        output: {
          path: path.resolve('./dist/assets/js'),
        },
      }),
      merge({}, defaults.webpack, {
        entry: {
          test: './src/preview/assets/js/test.js',
        },
        module: {
          rules: [
            {
              test: /qunit\.js$/,
              loader: 'expose-loader?QUnit',
            },
            {
              test: /\.css$/,
              loader: 'style-loader!css-loader',
            },
          ],
        },
        externals: {
          jquery: 'jQuery',
        },
        output: {
          path: path.resolve('./dist/preview/assets/js'),
        },
      }),
      merge({}, defaults.webpack, {
        entry: {
          'slideshow.test': './src/demo/modules/slideshow/slideshow.test.js',
        },
        externals: {
          jquery: 'jQuery',
          qunit: 'QUnit',
        },
        output: {
          path: path.resolve('./dist/preview/assets/js/test'),
        },
      }),
    ],
    logger: defaults.logger,
  }),
  jsTest: {
    src: [
      './dist/{pages,modules,demo}/**/*.html',
    ],
    srcBase: './dist',
    plugins: {
      interact: async (page) => {
        // Run tests
        const results = await estaticoQunit.puppeteer.run(page);

        // Report results
        if (results) {
          estaticoQunit.puppeteer.log(results);
        }
      },
    },
  },
  svgsprite: {
    src: {
      main: './src/assets/media/svg/**/*.svg',
      demo: './src/demo/modules/svgsprite/svg/*.svg',
    },
    srcBase: './src',
    dest: './dist',
  },
  jsLint: {
    src: [
      './src/**/*.js',
    ],
    srcBase: './src',
    dest: './src',
  },
};

// Exemplary tasks
const tasks = {
  html: estaticoHandlebars(config.html, env.dev),
  htmlValidate: estaticoHtmlValidate(config.htmlValidate, env.dev),
  css: estaticoSass(config.css, env.dev),
  cssLint: estaticoStylelint(config.cssLint, env.dev),
  js: estaticoWebpack(config.js, env.dev),
  jsTest: estaticoPuppeteer(config.jsTest, env.dev),
  jsLint: estaticoEslint(config.jsLint, env.dev),
  svgsprite: estaticoSvgsprite(config.svgsprite, env.dev),
  clean: () => del('./dist'),
};

// Register watchers
tasks.watch = () => {
  Object.keys(tasks).forEach((task) => {
    if (!(config[task] && config[task].watch)) {
      return;
    }

    const watchConfig = merge({}, {
      task: tasks[task],
      name: task,
    }, config[task].watch);

    const watcher = estaticoWatch(watchConfig);

    watcher();
  });

  tasks.js(() => {}, true);
};

// Register with gulp
Object.keys(tasks).forEach((task) => {
  gulp.task(task, tasks[task]);
});

gulp.task('default', gulp.series('clean', gulp.parallel('html', 'css', 'svgsprite'), gulp.parallel('htmlValidate', 'cssLint')), 'watch');
