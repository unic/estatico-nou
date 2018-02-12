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

function compareFiles(t, globPath) {
  const expected = glob.sync(globPath, {
    nodir: true,
  });

  expected.forEach((filePath) => {
    const resultedFilePath = filePath.replace(/expected\/(.*?)\//, 'results/');
    const expectedFile = fs.readFileSync(filePath).toString();
    const resultedFile = fs.readFileSync(resultedFilePath).toString();

    console.log(`Comparing ${chalk.yellow(filePath)} with ${chalk.yellow(resultedFilePath)}`);

    t.is(expectedFile, resultedFile);
  });

  t.end();
}

async function compareImages(t, globPath) {
  const expected = glob.sync(globPath, {
    nodir: true,
  });

  // eslint-disable-next-line no-restricted-syntax
  for (const filePath of expected) {
    const resultedFilePath = filePath.replace(/expected\/(.*?)\//, 'results/');

    const isEqual = await new Promise((resolve, reject) => { // eslint-disable-line no-await-in-loop
      gm.compare(filePath, resultedFilePath, 0.01, (err, equal) => {
        if (err) {
          return reject(err);
        }

        return resolve(equal);
      });
    });

    console.log(`Comparing ${chalk.yellow(filePath)} with ${chalk.yellow(resultedFilePath)}`);

    t.is(isEqual, true);
  }

  t.end();
}

module.exports = {
  stripLog,
  stripLogs,
  compareFiles,
  compareImages,
};
