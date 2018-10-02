const glob = require('glob');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const graphlib = require('graphlib');

const Graph = graphlib.Graph; // eslint-disable-line prefer-destructuring

function removeFileExtension(filePath) {
  const fileName = path.basename(filePath).split('.')[0];

  return filePath.replace(path.basename(filePath), fileName);
}

// API Docs: https://github.com/dagrejs/graphlib/wiki/API-Reference

class DependencyGraph {
  constructor(options) {
    let paths = Array.isArray(options.paths) ? options.paths : [options.paths];

    this.options = Object.assign({
      paths: [],
      resolver: {},
      logger: null,
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
    // Skip self-nesting partials
    if (filePath === parentFilePath) {
      return [];
    }

    const content = this.getFileContent(filePath);
    const type = path.extname(filePath).replace(/\./, '');
    const resolver = this.options.resolver[type];

    // Skip missing resolvers
    if (!resolver) {
      if (this.options.logger) {
        this.options.logger.debug(`Dependency graph: Resolver '${type}' not found`);
      }

      return [];
    }

    // Skip missing files
    if (!content) {
      if (this.options.logger) {
        this.options.logger.debug(`Dependency graph: ${chalk.yellow(filePath)} not found`);
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
    if (resolver.match) {
      while (match = resolver.match.exec(content)) { // eslint-disable-line no-cond-assign
        const matchedFilePath = resolver.resolve(match, filePath);

        if (matchedFilePath) {
          matches.push(matchedFilePath);
        } else if (this.options.logger) {
          this.options.logger.debug(`Dependency graph: ${chalk.yellow(match[0])} not found`);
        }
      }
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

  resolve(events) {
    return events.map((event) => {
      const resolvedPath = path.resolve(this.options.srcBase, event.path);
      const ancestors = this.getAncestors(resolvedPath);

      return ancestors.concat(resolvedPath);
    }).reduce((curr, acc) => acc.concat(curr), []);
  }

  match(originalResolvedGraph, originalFilePath, ignoreFileExtension) {
    let resolvedGraph = originalResolvedGraph;
    let filePath = originalFilePath;

    // Optionally match files without file extension
    if (ignoreFileExtension) {
      resolvedGraph = originalResolvedGraph.map(removeFileExtension);
      filePath = removeFileExtension(originalFilePath);
    }

    const matched = resolvedGraph.includes(filePath);

    if (this.options.logger) {
      this.options.logger.debug('Resolved watch graph:', resolvedGraph);

      if (!matched) {
        this.options.logger.debug(`${chalk.yellow(filePath)} not found in resolved graph. It will not be rebuilt.`);
      }
    }

    return matched;
  }
}

module.exports = DependencyGraph;
