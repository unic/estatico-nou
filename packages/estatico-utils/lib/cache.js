/* eslint-disable global-require */
const cache = {};

function readFileSync(filePath) {
  const fs = require('fs');

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const timestamp = fs.statSync(filePath).mtime.getTime();

  if (cache[filePath] && cache[filePath].timestamp === timestamp) {
    return cache[filePath].content;
  }

  const content = fs.readFileSync(filePath);

  cache[filePath] = {
    content,
    timestamp,
  };

  return content;
}

module.exports = readFileSync;
