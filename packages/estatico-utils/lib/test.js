const stripAnsi = require('strip-ansi');
const glob = require('glob');
const fs = require('fs');
const chalk = require('chalk');
const gm = require('gm');

function stripLog(str) {
  const logStr = stripAnsi(str)
    .replace(/\n/gm, '')
    .replace(/\t/g, ' ')
    .replace(/\s\s+/g, ' ');

  return logStr;
}

function stripLogs(sinonSpy) {
  const logs = sinonSpy.getCalls().map((call) => {
    let logStr = call.args.join(' ');

    logStr = stripLog(logStr);

    return logStr;
  }).join(' ');

  return logs;
}

function compareFiles(globPath) {
  const expected = glob.sync(globPath, {
    nodir: true,
  });

  return expected.map((filePath) => {
    const resultFilePath = filePath.replace(/expected\/(.*?)\//, 'results/');
    const expectedFile = fs.readFileSync(filePath).toString();
    const resultFile = fs.readFileSync(resultFilePath).toString();
    console.log(`Comparing ${chalk.yellow(filePath)} with ${chalk.yellow(resultFilePath)}`);

    return (expectedFile === resultFile);
  }).every(matchResult => matchResult);
}

async function compareImages(t, globPath) {
  const expected = glob.sync(globPath, {
    nodir: true,
  });

  // eslint-disable-next-line no-restricted-syntax
  for (const filePath of expected) {
    const resultedFilePath = filePath.replace(/expected\/(.*?)\//, 'results/');

    try {
      // eslint-disable-next-line no-await-in-loop
      const isEqual = await new Promise((resolve, reject) => {
        gm.compare(filePath, resultedFilePath, 0.1, (err, equal) => {
          if (err) {
            return reject(err);
          }

          return resolve(equal);
        });
      });

      console.log(isEqual ? chalk.green('✓') : chalk.red('×'), `Comparing ${chalk.yellow(filePath)} with ${chalk.yellow(resultedFilePath)}`);

      t.is(isEqual, true);
    } catch (err) {
      t.fail(err);
    }
  }

  t.end();
}

module.exports = {
  stripLog,
  stripLogs,
  compareFiles,
  compareImages,
};
