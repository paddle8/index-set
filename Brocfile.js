var compileES6 = require('broccoli-es6-concatenator');
var mergeTrees = require('broccoli-merge-trees');
var uglifyJs = require('broccoli-uglify-js');
var moveFile = require('broccoli-file-mover');
var env = process.env.BROCCOLI_ENV || 'development';

var lib = compileES6(mergeTrees(['lib', 'bower_components/loader.js']), {
  loaderFile: 'loader.js',
  inputFiles: [
    '**/*.js'
  ],
  wrapInEval: false,
  outputFile: '/index-set.js'
});

var libAndTests = compileES6(mergeTrees(['lib', 'bower_components/loader.js', 'tests']), {
  loaderFile: 'loader.js',
  inputFiles: [
    '**/*.js'
  ],
  wrapInEval: false,
  outputFile: '/index-set.js'
});

var amd = compileES6('lib', {
  inputFiles: [
    '**/*.js'
  ],
  wrapInEval: false,
  outputFile: '/index-set.amd.js'
});


var uglify = function (tree, filename) {
  var minFilename = filename.split('.');
  minFilename.pop();
  minFilename.push('min', 'js');
  return uglifyJs(moveFile(tree, {
    srcFile: '/' + filename,
    destFile: '/' + minFilename.join('.')
  }));
};

if (env === 'test') {
  module.exports = mergeTrees([
    'public',
    libAndTests
  ]);
} else {
  module.exports = mergeTrees([
    lib,
    uglify(lib, 'index-set.js'),
    amd,
    uglify(amd, 'index-set.amd.js')
  ]);
}
