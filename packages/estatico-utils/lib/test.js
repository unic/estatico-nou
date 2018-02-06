const stripAnsi = require('strip-ansi');
const glob = require('glob');
const fs = require('fs');
const path = require('path');

function stripLog(str) {
  const log = stripAnsi(str)
    .replace(/\n/gm, '')
    .replace(/\t/g, ' ')
    .replace(/\s\s+/g, ' ');

  return log;
}

function stripLogs(sinonSpy) {
  const logs = sinonSpy.getCalls().map((call) => {
    let log = call.args.join(' ');

    log = stripLog(log);

    return log;
  }).join(' ');

  return logs;
}

function compareFiles(t, name) {
  const expected = glob.sync(path.join(__dirname, `expected/${name}/*`), {
    nodir: true,
  });

  expected.forEach((filePath) => {
    const expectedFile = fs.readFileSync(filePath).toString();
    const resultedFile = fs.readFileSync(filePath.replace(`expected/${name}`, 'results')).toString();

    t.is(expectedFile, resultedFile);
  });

  t.end();
}

module.exports = {
  stripLog,
  stripLogs,
  compareFiles,
};
