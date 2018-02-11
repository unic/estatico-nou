/* eslint-disable global-require */
const gulp = require('gulp');
const path = require('path');
const fs = require('fs');
const env = require('minimist')(process.argv.slice(2));


/**
 * HTML task
 * Transforms Handlebars to HTML
 *
 * Using `--watch` (or manually setting `env` to `{ dev: true }`) starts file watcher
 */
gulp.task('html', () => {
  const task = require('@unic/estatico-handlebars');
  const moduleTemplate = fs.readFileSync('./src/preview/layouts/module.hbs', 'utf8');
  const estaticoQunit = require('@unic/estatico-qunit');

  const instance = task({
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
        './src/**/*.data.js',
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
  }, env);

  return instance();
});

/**
 * HTML validation task
 * Sends HTML pages through the [w3c validator](https://validator.w3.org/).
 *
 * Using `--watch` (or manually setting `env` to `{ dev: true }`) starts file watcher
 */
gulp.task('html:validate', () => {
  const task = require('@unic/estatico-w3c-validator');

  const instance = task({
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
      name: 'html:validate',
    },
  }, env);

  return instance();
});

/**
 * CSS task
 * Transforms Sass to CSS, uses PostCSS (autoprefixer and clean-css) to transform the output
 *
 * Using `--dev` (or manually setting `env` to `{ dev: true }`) skips minification
 * Using `--watch` (or manually setting `env` to `{ dev: true }`) starts file watcher
 */
gulp.task('css', () => {
  const task = require('@unic/estatico-sass');
  const nodeSassJsonImporter = require('node-sass-json-importer');
  const autoprefixer = require('autoprefixer');

  const instance = task({
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
      name: 'css',
      dependencyGraph: {
        srcBase: './',
        resolver: {
          scss: {
            match: /@import[\s-]*["|']?([^"\s(]+).*?/g,
            resolve: (match, filePath) => {
              if (!match[1]) {
                return null;
              }

              // Find possible path candidates
              const candidates = [
                path.dirname(filePath),
                './src/',
                './src/assets/css/',
              ].map((dir) => {
                const partialPath = match[1].replace(path.basename(match[1]), `_${path.basename(match[1])}`);
                const candidatePath = path.resolve(dir, match[1]);
                const candidatePartialPath = path.resolve(dir, partialPath);
                const candidatePaths = [
                  candidatePath,
                  candidatePartialPath,
                  // .scss extension
                  path.extname(candidatePath) ? candidatePath : `${candidatePath}.scss`,
                  path.extname(candidatePartialPath) ? candidatePartialPath : `${candidatePartialPath}.scss`,
                  // .css extension
                  path.extname(candidatePath) ? candidatePath : `${candidatePath}.css`,
                ];

                // Remove duplicates
                return [...new Set(candidatePaths)];
              }).reduce((arr, curr) => arr.concat(curr), []); // Flatten

              return candidates.find(fs.existsSync) || null;
            },
          },
        },
      },
    },
    plugins: {
      sass: {
        includePaths: [
          './src/',
          './src/assets/css/',
        ],
        importer: [
          // Add importer being able to deal with json files like colors, e.g.
          nodeSassJsonImporter,
        ],
      },
      postcss: [
        autoprefixer({
          // Custom autoprefixer config
          browsers: ['last 10 versions'],
        }),
      ],
    },
  }, env);

  return instance();
});

/**
 * CSS linting task
 * Uses Stylelint to lint (and possibly autofix files in the future)
 *
 * Using `--watch` (or manually setting `env` to `{ dev: true }`) starts file watcher
 */
gulp.task('css:lint', () => {
  const task = require('@unic/estatico-stylelint');

  const instance = task({
    src: [
      './src/**/*.scss',
    ],
    srcBase: './src/',
    dest: './dist',
    // watch: {
    //   src: [
    //     './src/**/*.scss',
    //   ],
    //   name: 'css:lint',
    // },
  }, env);

  return instance();
});

/**
 * CSS font inlining task
 * Uses `gulp-simplefont64` to inline font files into base64-encoded data URIs
 *
 * Using `--watch` (or manually setting `env` to `{ dev: true }`) starts file watcher
 */
gulp.task('css:fonts', () => {
  const task = require('@unic/estatico-font-datauri');

  const instance = task({
    src: [
      './src/assets/fonts/**/*',
    ],
    dest: './src/assets/.tmp',
    plugins: {
      concat: 'fonts.scss',
    },
    watch: {
      src: [
        './src/assets/fonts/**/*',
      ],
      name: 'css:fonts',
    },
  }, env);

  return instance();
});

/**
 * JavaScript bundling task
 * Uses Webpack with Babel to transpile and bundle JavaScript.
 *
 * Using `--watch` (or manually setting `env` to `{ dev: true }`) starts file watcher
 */
gulp.task('js', (cb) => {
  const task = require('@unic/estatico-webpack');
  const merge = require('lodash.merge');
  const glob = require('glob');

  const instance = task(defaults => ({
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
  }), env);

  return instance(cb);
});

/**
 * JavaScript linting task
 * Uses ESLint to lint and autofix files
 *
 * Using `--watch` (or manually setting `env` to `{ dev: true }`) starts file watcher
 */
gulp.task('js:lint', () => {
  const task = require('@unic/estatico-eslint');

  const instance = task({
    src: [
      './src/**/*.js',
    ],
    srcBase: './src',
    dest: './src',
    watch: {
      src: [
        './src/**/*.js',
      ],
      name: 'js:lint',
    },
  }, env);

  return instance();
});

/**
 * JavaScript testing task
 * Uses Puppeteer to check for JS errors and run tests
 *
 * Using `--watch` (or manually setting `env` to `{ dev: true }`) starts file watcher
 */
gulp.task('js:test', () => {
  const task = require('@unic/estatico-puppeteer');
  const estaticoQunit = require('@unic/estatico-qunit');

  const instance = task({
    src: [
      './dist/{pages,modules,demo}/**/*.html',
    ],
    srcBase: './dist',
    watch: {
      src: [
        './src/**/*.test.js',
      ],
      name: 'js:test',
    },
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
      interact: async (page, logger) => {
        // Run tests
        const results = await estaticoQunit.puppeteer.run(page);

        // Report results
        if (results) {
          estaticoQunit.puppeteer.log(results, logger);
        }
      },
    },
  }, env);

  return instance();
});

/**
 * JavaScript data mocks
 * Creates static JSON data mocks
 *
 * Using `--watch` (or manually setting `env` to `{ dev: true }`) starts file watcher
 */
gulp.task('js:mocks', () => {
  const task = require('@unic/estatico-json-mocks');

  const instance = task({
    src: [
      './src/**/*.mock.js',
    ],
    srcBase: './src',
    dest: './dist/mocks',
    watch: {
      src: [
        './src/**/*.mock.js',
      ],
      name: 'js:mocks',
    },
  }, env);

  return instance();
});

/**
 * SVG spriting task
 * Uses svgstore to create a sprite from multiple SVGs
 *
 * Using `--watch` (or manually setting `env` to `{ dev: true }`) starts file watcher
 */
gulp.task('media:svgsprite', () => {
  const task = require('@unic/estatico-svgsprite');

  const instance = task({
    src: {
      main: './src/assets/media/svg/**/*.svg',
      demo: './src/demo/modules/svgsprite/svg/*.svg',
    },
    srcBase: './src',
    dest: './dist/assets/media/svgsprite',
  }, env);

  return instance();
});

/**
 * Serve task
 * Uses Browsersync to serve the build directory, reloads on changes
 */
gulp.task('serve', () => {
  const task = require('@unic/estatico-browsersync');

  const instance = task({
    plugins: {
      browsersync: {
        server: './dist',
        watch: './dist/**/*.{html,css,js}',
      },
    },
  }, env);

  return instance();
});

/**
 * Clean build directory
 */
gulp.task('clean', () => {
  const del = require('del');

  return del(['./dist', './src/assets/.tmp']);
});

/**
 * Test & lint / validate
 */
gulp.task('lint', gulp.parallel(/* 'css:lint', */ 'js:lint'));
gulp.task('test', gulp.parallel('html:validate', 'js:test'));

/**
 * Create complete build
 * Prompts whether tests and linting should run
 *
 * --noInteractive / --skipTests will bypass the prompt
 */
gulp.task('build', (done) => {
  const inquirer = require('inquirer');
  const build = gulp.parallel('html', gulp.series('css:fonts', 'css'), 'js', 'js:mocks', 'media:svgsprite');

  const cb = (skipTests) => {
    if (skipTests) {
      gulp.series('clean', build)(done);
    } else {
      gulp.series('clean', 'lint', build, 'test')(done);
    }
  };

  if (!env.noInteractive && !env.skipTests) {
    inquirer.prompt([{
      type: 'confirm',
      name: 'skipTests',
      message: 'Do you want to skip tests and linting?',
      default: false,
    }]).then(answers => cb(answers.skipTests));
  } else {
    cb(env.skipTests);
  }
});

/**
 * Default development task
 * Prompts whether build should be created initially
 *
 * --noInteractive / --skipBuild will bypass the prompt
 */
gulp.task('default', (done) => {
  const inquirer = require('inquirer');

  const cb = (skipBuild) => {
    if (skipBuild) {
      if (env.watch) {
        // Webpack tasks need to run to be able to start watcher
        gulp.series('js', 'serve')(done);
      } else {
        gulp.series('serve')(done);
      }
    } else {
      gulp.series('build', 'serve')(done);
    }
  };

  if (!env.noInteractive && !env.skipBuild) {
    inquirer.prompt([{
      type: 'confirm',
      name: 'skipBuild',
      message: 'Do you want to skip the build before starting the server?',
      default: false,
    }]).then(answers => cb(answers.skipBuild));
  } else {
    cb(env.skipBuild);
  }
});
