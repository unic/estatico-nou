const glob = require('glob');
const fs = require('fs');
const path = require('path');
const log = require('fancy-log');
// const chalk = require('chalk');
const graphlib = require('graphlib');

const Graph = graphlib.Graph; // eslint-disable-line prefer-destructuring

// API Docs: https://github.com/dagrejs/graphlib/wiki/API-Reference

class DependencyGraph {
  constructor(options) {
    let paths = Array.isArray(options.paths) ? options.paths : [options.paths];

    this.options = Object.assign({
      paths: [],
      resolver: {},
      log: false,
    }, options);

    this.graph = new Graph();
    this.cache = {};

    // Resolve globs
    paths = paths.map(fileGlob => glob.sync(fileGlob)).reduce((acc, curr) => acc.concat(curr), []);

    paths = paths.map(filePath => path.resolve(filePath));

    this.paths = [...new Set(paths)];

    // Parse files
    this.paths.forEach(filePath => this.extend(filePath));

    // console.log(graphlib.json.write(this.graph));
  }

  extend(filePath, parentFilePath) { // eslint-disable-line consistent-return
    const content = this.getFileContent(filePath);
    const type = path.extname(filePath).replace(/\./, '');
    const resolver = this.options.resolver[type];

    // Skip missing resolvers
    if (!resolver) {
      if (this.options.log) {
        log('DependencyGraph', `Resolver '${path.extname(filePath)}' not found`);
      }

      return [];
    }

    // Skip missing files
    if (!content) {
      if (this.options.log) {
        log('DependencyGraph', `'${filePath}' not found`);
      }

      return [];
    }

    const matches = [];
    let match;

    // Add to graph
    if (!this.graph.hasNode(filePath)) {
      this.graph.setNode(filePath);
    }

    if (parentFilePath) {
      this.graph.setEdge(parentFilePath, filePath);
    }

    // Find matches
    while (match = resolver.match.exec(content)) { // eslint-disable-line no-cond-assign
      const matchedFilePath = resolver.resolve(match, filePath);

      matches.push(matchedFilePath);
    }

    // Add new matches to graph
    matches.forEach(matchedFilePath => this.extend(matchedFilePath, filePath));
  }

  getAncestors(filePath) {
    const parents = this.graph.predecessors(filePath) || [];

    if (!parents.length) {
      return [];
    }

    // Flatten
    let ancestors = parents.reduce((acc, curr) => acc.concat(this.getAncestors(curr)), [])
      .concat(parents);

    // Remove duplicates
    ancestors = [...new Set(ancestors)];

    return ancestors;
  }

  updateNode(filePath) {
    // Remove edges
    this.graph.outEdges(filePath).forEach(edge => this.graph.removeEdge(edge));

    // Add new sub graph
    this.extend(filePath);
  }

  getFileContent(filePath) {
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const timestamp = fs.statSync(filePath).mtime.getTime();

    if (this.cache[filePath] && this.cache[filePath].timestamp === timestamp) {
      return this.cache[filePath].content;
    }

    const content = fs.readFileSync(filePath).toString();

    this.cache[filePath] = {
      content,
      timestamp,
    };

    return content;
  }
}

module.exports = DependencyGraph;
