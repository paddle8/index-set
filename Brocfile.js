var uglifyJavaScript = require('broccoli-uglify-js'),
    pickFiles = require('broccoli-static-compiler'),
    mergeTrees = require('broccoli-merge-trees'),
    moveFile = require('broccoli-file-mover'),
    compileES6 = require('broccoli-es6-concatenator'),
    env = process.env.BROCCOLI_ENV || 'development';

var publicFiles = 'public';

var lib = 'lib';
lib = pickFiles(lib, {
  srcDir: '/',
  destDir: ''
});

var vendor = 'vendor';
var libAndVendorTree = mergeTrees([lib, vendor]);

var libJs = compileES6(libAndVendorTree, {
  loaderFile: 'loader.js',
  inputFiles: [
    '**/*.js'
  ],
  outputFile: '/index-set.js',
  wrapInEval: false
});

var tests = 'tests';
tests = pickFiles(tests, {
  srcDir: '/',
  destDir: 'tests'
});

var testsJs = mergeTrees([lib, vendor, tests]);
testsJs = compileES6(testsJs, {
  loaderFile: 'loader.js',
  inputFiles: [
    '**/*.js'
  ],
  outputFile: '/index-set.js'
});

var minifiedJs = uglifyJavaScript(moveFile(libJs, {
  srcFile: 'index-set.js',
  destFile: 'index-set.min.js'
}));

if (env === 'test') {
  libJs = testsJs;
}

module.exports = mergeTrees([publicFiles, libJs, minifiedJs]);
