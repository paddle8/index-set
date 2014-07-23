var uglifyJavaScript = require('broccoli-uglify-js'),
    pickFiles = require('broccoli-static-compiler'),
    mergeTrees = require('broccoli-merge-trees'),
    moveFile = require('broccoli-file-mover'),
    compileES6 = require('broccoli-es6-concatenator'),
    env = process.env.BROCCOLI_ENV || 'development';

var publicFiles = 'public';
var vendor = 'vendor';

var lib = 'lib';
lib = pickFiles(lib, {
  srcDir: '/',
  destDir: ''
});

var libAndVendorTree = mergeTrees([lib, vendor]);

var libJs = compileES6(libAndVendorTree, {
  loaderFile: 'loader.js',
  inputFiles: [
    '**/*.js'
  ],
  outputFile: '/index-set.js',
  wrapInEval: false
});

var amdJs = compileES6(lib, {
  inputFiles: [
    '**/*.js'
  ],
  outputFile: '/index-set.amd.js',
  wrapInEval: false
});


var tests = 'tests';
tests = pickFiles(tests, {
  srcDir: '/',
  destDir: 'tests'
});

var testsJs = mergeTrees([lib, tests]);
testsJs = compileES6(testsJs, {
  inputFiles: [
    '**/*.js'
  ],
  outputFile: '/index-set.js'
});

var minifiedAmdJs = uglifyJavaScript(moveFile(amdJs, {
  srcFile: 'index-set.amd.js',
  destFile: 'index-set.amd.min.js'
}));

var minifiedJs = uglifyJavaScript(moveFile(libJs, {
  srcFile: 'index-set.js',
  destFile: 'index-set.min.js'
}));

if (env === 'test') {
  libJs = testsJs;
}

module.exports = mergeTrees([publicFiles, libJs, amdJs, minifiedJs, minifiedAmdJs]);
