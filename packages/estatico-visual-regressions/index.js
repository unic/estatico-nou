const Joi = require('joi');
const merge = require('lodash.merge');
const mkdirp = require('mkdirp');
const path = require('path');
const fs = require('fs');

const getDiff = require('./lib/diff');

const schema = Joi.object().keys({
  dest: Joi.string().required(),
  destDiff: Joi.string().required(),
  srcReferences: Joi.string().required(),
  getTargets: Joi.func().required(),
  getFileName: Joi.func().required(),
  pixelmatch: Joi.object(),
  maxDiffPixels: Joi.number().required(),
  viewports: Joi.object().allow(null),
});

module.exports = async (page, options) => {
  const config = merge({}, {
    // See README for details
    dest: './screenshots/results',
    destDiff: './screenshots/diff',
    srcReferences: './screenshots/references',
    getTargets: pageInstance => [pageInstance],
    getFileName: (url, viewport, targetIndex) => {
      let fileName = path.basename(url, path.extname(url));

      fileName = `${fileName}-${viewport}`;
      fileName = `${fileName}${!isNaN(parseFloat(targetIndex)) ? `-${targetIndex}` : ''}`;

      return fileName;
    },
    viewports: null,
    pixelmatch: {
      threshold: 0.5,
    },
    maxDiffPixels: 50,
  }, options);

  // Check config for completeness
  const validate = Joi.validate(config, schema, {
    allowUnknown: true,
  });

  if (validate.error) {
    throw new Error(`Config validation: ${validate.error}`);
  }

  // Start testing
  const url = page.url();
  const viewport = page.viewport();

  // Optionally use viewport name for more intuitive file naming
  // Fall back to viewport width otherwise
  // eslint-disable-next-line arrow-body-style
  const viewportName = config.viewports ? Object.keys(config.viewports).find((name) => {
    return config.viewports[name].width === viewport.width;
  }) : viewport.width;

  // Find elements to take screenshots from
  const targets = await config.getTargets(page);

  // Set up file system
  mkdirp.sync(config.srcReferences);
  mkdirp.sync(config.dest);
  mkdirp.sync(config.destDiff);

  // Hold results
  const results = {};

  // Select target elements, create screenshot and compare to reference
  // eslint-disable-next-line no-restricted-syntax
  for (const [i, target] of targets.entries()) {
    const fileName = config.getFileName(url, viewportName, targets.length > 1 ? i : null);
    const filePath = `${config.dest}/${fileName}.png`;
    const referencePath = `${config.srcReferences}/${fileName}.png`;
    const diffPath = `${config.destDiff}/${fileName}.png`;

    try {
      // eslint-disable-next-line no-await-in-loop
      const targetElement = Promise.resolve(target) === target ? await target : target;
// console.log(await targetElement.boxModel())
      // Create screenshot
      // eslint-disable-next-line no-await-in-loop
      const screenshot = await targetElement.screenshot({
        path: filePath,
      });

      // Compare to reference
      if (fs.existsSync(referencePath)) {
        const reference = fs.readFileSync(referencePath);

        const diff = getDiff(screenshot, reference, config.pixelmatch);

        // Check number of different pixels
        if (diff.pixels > config.maxDiffPixels) {
          // Save diff image
          fs.writeFileSync(diffPath, diff.buffer);

          results[fileName] = {
            passed: false,
            diff,
            diffPath,
          };
        } else {
          results[fileName] = {
            passed: true,
            diff,
          };
        }
      } else {
        // Save as new reference if missing
        fs.writeFileSync(referencePath, screenshot);

        results[fileName] = {
          generated: true,
        };
      }
    } catch (err) {
      // Something failed, possibly taking a screenshot
      results[fileName] = {
        err,
      };
    }
  }

  return results;
};

// Custom logger for use in gulp task
module.exports.log = (results, taskLogger, isDev) => {
  const chalk = require('chalk'); // eslint-disable-line global-require

  Object.keys(results).forEach((fileName) => {
    const result = results[fileName];

    if (result.err) {
      taskLogger.error(`${chalk.yellow(`${fileName}`)} failed with ${result.err}`, isDev);
    } else if (result.generated) {
      taskLogger.info(`Saved ${chalk.yellow(`${fileName}`)} as new reference`);
    } else if (result.passed) {
      taskLogger.info(`${chalk.yellow(`${fileName}`)} looks fine`);
    } else {
      taskLogger.error(`Found ${result.diff.pixels} different pixels for ${chalk.yellow(`${fileName}`)}, see ${result.diffPath}`, isDev);
    }
  });
};
