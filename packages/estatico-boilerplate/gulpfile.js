/* eslint-disable global-require */
const gulp = require('gulp');
const path = require('path');
const fs = require('fs');
const parseArgs = require('minimist');
const merge = require('lodash.merge');
const glob = require('glob');
const del = require('del');
const inquirer = require('inquirer');

const estaticoHandlebars = require('@unic/estatico-handlebars');
const estaticoHtmlValidate = require('@unic/estatico-w3c-validator');
const estaticoSass = require('@unic/estatico-sass');
const estaticoStylelint = require('@unic/estatico-stylelint');
const estaticoWebpack = require('@unic/estatico-webpack');
const estaticoWatch = require('@unic/estatico-watch');
const estaticoPuppeteer = require('@unic/estatico-puppeteer');
const estaticoQunit = require('@unic/estatico-qunit');
const estaticoSvgsprite = require('@unic/estatico-svgsprite');
const estaticoEslint = require('@unic/estatico-eslint');
const estaticoBrowsersync = require('@unic/estatico-browsersync');

const env = parseArgs(process.argv.slice(2));
const moduleTemplate = fs.readFileSync('./src/preview/layouts/module.hbs', 'utf8');


/**
 * HTML task
 * Transforms Handlebars to HTML
 *
 * Using `--watch` (or manually setting `env` to `{ dev: true }`) starts file watcher
 */
gulp.task('html', estaticoHandlebars({
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
  watch: {
    src: [
      './src/**/*.hbs',
    ],
    name: 'html',
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
  plugins: {
    clone: null,
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
    // Wrap with module layout
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
}, env));

/**
 * CSS task
 * Transforms Sass to CSS, uses PostCSS (autoprefixer and clean-css) to transform the output
 *
 * Using `--dev` (or manually setting `env` to `{ dev: true }`) skips minification
 * Using `--watch` (or manually setting `env` to `{ dev: true }`) starts file watcher
 */
gulp.task('css', estaticoSass({
  src: [
    './src/assets/css/**/*.scss',
    './src/preview/assets/css/**/*.scss',
  ],
  srcBase: './src/',
  dest: './dist',
  watch: {
    src: [
      './src/**/*.scss',
    ],
    name: 'css', // Displayed in watch log
  },
  plugins: {
    sass: {
      includePaths: [
        './src/',
        './src/assets/css/',
      ],
      importer: [
        // Add importer being able to deal with json files like colors, e.g.
        require('node-sass-json-importer'),
      ],
    },
  },
}, env));

/**
 * JavaScript linting task
 * Uses ESLint to lint and autofix files
 *
 * Using `--watch` (or manually setting `env` to `{ dev: true }`) starts file watcher
 */
gulp.task('js:lint', estaticoEslint({
  src: [
    './src/**/*.js',
  ],
  srcBase: './src',
  dest: './src',
  watch: {
    src: [
      './src/**/*.js',
    ],
    name: 'js:lint', // Displayed in watch log
  },
}, env));

/**
 * Serve task
 * Uses Browsersync to serve the build directory, reloads on changes
 */
gulp.task('serve', estaticoBrowsersync({
  plugins: {
    browsersync: {
      server: './dist',
      watch: './dist/**/*.{html,css,js}',
    },
  },
}, env));


// Exemplary custom config
const config = {
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
      {
        entry: {
          test: './src/preview/assets/js/test.js',
        },
        module: {
          rules: defaults.webpack.module.rules.concat([
            {
              test: /qunit\.js$/,
              loader: 'expose-loader?QUnit',
            },
            {
              test: /\.css$/,
              loader: 'style-loader!css-loader',
            },
          ]),
        },
        externals: {
          jquery: 'jQuery',
        },
        output: {
          path: path.resolve('./dist/preview/assets/js'),
        },
        mode: 'development',
      },
      {
        // Create object of fileName:filePath pairs
        entry: glob.sync('./src/**/*.test.js').reduce((obj, item) => {
          const key = path.basename(item, path.extname(item));

          obj[key] = item; // eslint-disable-line no-param-reassign

          return obj;
        }, {}),
        module: defaults.webpack.module,
        externals: {
          jquery: 'jQuery',
          qunit: 'QUnit',
        },
        output: {
          path: path.resolve('./dist/preview/assets/js/test'),
        },
        mode: 'development',
      },
    ],
    logger: defaults.logger,
  }),
  jsTest: {
    src: [
      './dist/{pages,modules,demo}/**/*.html',
    ],
    srcBase: './dist',
    viewports: {
      mobile: {
        width: 400,
        height: 1000,
        isMobile: true,
      },
      // tablet: {
      //   width: 700,
      //   height: 1000,
      //   isMobile: true,
      // },
      desktop: {
        width: 1400,
        height: 1000,
      },
    },
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
};

// Exemplary tasks
const tasks = {
  htmlValidate: estaticoHtmlValidate(config.htmlValidate, env.dev),
  cssLint: estaticoStylelint(config.cssLint, env.dev),
  js: estaticoWebpack(config.js, env.dev),
  jsTest: estaticoPuppeteer(config.jsTest, env.dev),
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

  // Start webpack watcher
  tasks.js(() => {}, true);
};

// Register with gulp
Object.keys(tasks).forEach((task) => {
  gulp.task(task, tasks[task]);
});

// gulp.task('lint', gulp.parallel(/* 'htmlValidate', 'cssLint', */ 'jsLint', 'jsTest'));
// gulp.task('build', gulp.series('clean', gulp.parallel('html', 'css', 'js', 'svgsprite'), 'lint'));
// gulp.task('dev', gulp.parallel('watch', 'serve'));

gulp.task('default', (done) => {
  const cb = (skipBuild) => {
    if (skipBuild) {
      return gulp.series('dev')(done);
    }

    return gulp.series('build', 'dev')(done);
  };

  if (!env.noInteractive && !env.skipBuild) {
    return inquirer.prompt([{
      type: 'confirm',
      name: 'skipBuild',
      message: 'Do you want to skip the build before starting the server?',
      default: false,
    }]).then(answers => cb(answers.skipBuild));
  }

  return cb(env.skipBuild);
});
