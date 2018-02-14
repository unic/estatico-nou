/* eslint-disable global-require */
const { Plugin, Logger } = require('@unic/estatico-utils');
const Joi = require('joi');

// Config schema used for validation
const schema = Joi.object().keys({
  types: Joi.array().items(Joi.object().keys({
    name: Joi.string().required(),
    src: Joi.string().required(),
    dist: Joi.string().required(),
    transformName: Joi.func(),
    modifications: Joi.func(),
  })),
  logger: Joi.object().keys({
    info: Joi.func(),
    error: Joi.func(),
    debug: Joi.func(),
  }),
});

/**
 * Default config
 * @param {object} env - Optional environment config, e.g. { dev: true }
 * @return {object}
 */
const defaults = (/* env */) => ({
  types: null,
  logger: new Logger('estatico-scaffold'),
});

/**
 * Task function
 * @param {object} config - Complete task config
 * @param {object} env - Optional environment config, e.g. { dev: true }
 * @return {object} gulp stream
 */
const task = (config, env = {}) => {
  const gulp = require('gulp');
  const through = require('through2');
  const glob = require('glob');
  const del = require('del');
  const path = require('path');
  const nodePlop = require('node-plop');
  const plop = nodePlop();

  function copy(scaffoldConfig) {
    return new Promise((resolve) => {
      gulp.src(`${scaffoldConfig.src}/*`, {
        base: scaffoldConfig.src,
      })
        .pipe(through.obj((file, enc, done) => {
          file.path = file.path.replace(new RegExp(path.basename(scaffoldConfig.src), 'g'), scaffoldConfig.name); // eslint-disable-line no-param-reassign

          done(null, file);
        }))
        .pipe(gulp.dest(`${scaffoldConfig.dist}/${scaffoldConfig.name}`))
        .on('end', () => resolve());
    });
  }

  function rename(scaffoldConfig) {
    return copy(scaffoldConfig).then(() => del(scaffoldConfig.src));
  }

  const generator = plop.setGenerator('default', {
    prompts: () => plop.inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        choices: ['Add', 'Remove', 'Copy', 'Rename'],
        message: 'Choose an action',
      },
      {
        type: 'list',
        name: 'type',
        choices: config.types.map(type => type.name),
        message: 'Choose a type',
      },
    ]).then((answers) => {
      const scaffoldConfig = config.types.find(type => type.name === answers.type);

      // Prompt for name and list of available scaffold files
      // The latter allows us to skip JS/CSS files, e.g.
      if (answers.action === 'Add') {
        return plop.inquirer.prompt([
          {
            type: 'input',
            name: 'name',
            message: 'Set a name',
            validate: (input) => {
              if (!input) {
                return 'Please set a name';
              }

              return true;
            },
          },
          {
            type: 'checkbox',
            name: 'files',
            message: 'Select files to add',
            choices: glob.sync(scaffoldConfig.src).map(filePath => ({
              name: filePath,
              // Escape handlebars tags to make sure plop.js does not rename files too early
              value: filePath.replace(/{{/g, '\\{{'),
              checked: true,
            })),
          },
        ]).then(answer => Object.assign(
          {}, answers, answer,
          // Add name variants like ClassName (PascalCase), fileName (cameCase) etc.
          scaffoldConfig.transformName ? scaffoldConfig.transformName(answer.name) : null,
        ));
      }

      // Show list of available items to Copy/Rename/Remove
      return plop.inquirer.prompt([
        {
          type: 'list',
          name: 'name',
          message: `Select ${answers.type}`,
          choices: glob.sync(`${scaffoldConfig.dist}/*`).map(filePath => ({
            name: path.basename(filePath),
            value: filePath,
          })),
        },
      ]).then(answer => Object.assign(
        {}, answers, answer,
        // Add name variants like ClassName (PascalCase), fileName (cameCase) etc.
        scaffoldConfig.transformName ? scaffoldConfig.transformName(answer.name) : null,
      ));
    }).then((answers) => {
      if (answers.action === 'Add' || answers.action === 'Remove') {
        return answers;
      }

      const scaffoldConfig = config.types.find(type => type.name === answers.type);

      // Prompt for new name in case of Copy/Rename
      return plop.inquirer.prompt([
        {
          type: 'input',
          name: 'newName',
          message: 'Set a new name',
          validate: (input) => {
            if (!input) {
              return 'Please set a new name';
            }

            return true;
          },
        },
      ]).then(answer => Object.assign(
        {}, answers, answer,
        // Add name variants like ClassName (PascalCase), fileName (cameCase) etc.
        scaffoldConfig.transformName ? scaffoldConfig.transformName(answer.newName, true) : null,
      ));
    }),
    actions: (answers) => {
      const scaffoldConfig = config.types.find(type => type.name === answers.type);
      const modifications = scaffoldConfig.modifications ?
        scaffoldConfig.modifications(answers) :
        [];

      switch (answers.action) {
        case 'Add':
          return modifications.concat([
            {
              type: 'addMany',
              destination: `${scaffoldConfig.dist}/${answers.fileName}`,
              base: path.dirname(scaffoldConfig.src),
              templateFiles: answers.files,
              abortOnFail: true,
            },
          ]);
        case 'Remove':
          return [
            () => del(answers.name),
          ];
        case 'Copy':
          return modifications.concat([
            () => copy({
              src: answers.name,
              dist: scaffoldConfig.dist,
              name: answers.newFileName,
            }),
          ]);
        case 'Rename':
          return modifications.concat([
            () => rename({
              src: answers.name,
              dist: scaffoldConfig.dist,
              name: answers.newFileName,
            }),
          ]);
        default:
          return [];
      }
    },
  });

  return generator.runPrompts().then(generator.runActions).then((results) => {
    if (results.failures && results.failures.length && Object.keys(results.failures[0]).length) {
      config.logger.error(new Error(JSON.stringify(results.failures)), env.dev);
    }

    return results;
  });
};

/**
 * @param {object|func} options - Custom config
 *  Either deep-merged (object) or called (func) with defaults
 * @param {object} env - Optional environment config, e.g. { dev: true }, passed to defaults
 * @return {func} Task function from above with bound config and env
 */
module.exports = (options, env = {}) => new Plugin({
  defaults,
  schema,
  options,
  task,
  env,
});
