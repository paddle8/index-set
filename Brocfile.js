/* jshint node: true */
var ES6Module = require('broccoli-es6modules');
var mergeTrees = require('broccoli-merge-trees');
var uglifyJs = require('broccoli-uglify-js');
var Funnel = require('broccoli-funnel');
var concat = require('broccoli-concat');
var env = process.env.BROCCOLI_ENV || 'development';

var rename = function (tree, filename, name) {
  return new Funnel(tree, {
    destDir: '/',
    getDestinationPath: function (relativePath) {
      if (relativePath === filename) {
        return name;
      }

      return relativePath;
    }
  });
};

var move = function (root, files, destination) {
  return new Funnel(root, {
    destDir: destination || '/',
    include: files
  });
}

var lib = new ES6Module('lib', {
  format: 'umd',
  bundleOptions: {
    entry: 'index-set.js',
    name: 'IndexSet'
  }
});
lib = rename(lib, 'IndexSet.js', 'index-set.js');

var tests = concat('tests', {
  inputFiles: [
    '*-test.js'
  ],
  outputFile: '/index-set-tests.js',
  separator: '\n',
  wrapInFunction: true
});

var amd = new ES6Module('lib', {
  format: 'namedAmd',
  bundleOptions: {
    entry: 'index-set.js',
    name: 'index-set'
  }
});
amd = rename(amd, 'index-set.js', 'index-set.amd.js');

var uglify = function (tree, filename) {
  var minFilename = filename.split('.');
  minFilename.pop();
  minFilename.push('min', 'js');
  return uglifyJs(rename(tree, filename, minFilename.join('.')));
};

if (env === 'test') {
  module.exports = mergeTrees([
    move('bower_components/qunit/qunit', ['qunit.css', 'qunit.js']),
    move('tests', ['index.html']),
    lib,
    tests
  ]);
} else {
  module.exports = mergeTrees([
    lib,
    uglify(lib, 'index-set.js'),
    amd,
    uglify(amd, 'index-set.amd.js')
  ]);
}
