const stripAnsi = require('strip-ansi');
const glob = require('glob');
const fs = require('fs');
const chalk = require('chalk');
const Logger = require('./logger');

const logger = new Logger('Testing');

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

    logger.info(`Comparing ${chalk.yellow(filePath)} with ${chalk.yellow(resultedFilePath)}`);

    t.is(expectedFile, resultedFile);
  });

  t.end();
}

module.exports = {
  stripLog,
  stripLogs,
  compareFiles,
};
