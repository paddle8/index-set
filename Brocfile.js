module.exports = function (broccoli) {
  var uglifyJavaScript = require('broccoli-uglify-js'),
      pickFiles = require('broccoli-static-compiler'),
      compileES6 = require('broccoli-es6-concatenator'),
      env = process.env.BROCCOLI_ENV || 'development';

  var publicTree = broccoli.makeTree('public');

  var lib = broccoli.makeTree('lib');
  lib = pickFiles(lib, {
    srcDir: '/',
    destDir: ''
  });

  var vendor = broccoli.makeTree('vendor');

  var libAndVendorTree = new broccoli.MergedTree([lib, vendor]);

  var libJs = compileES6(libAndVendorTree, {
    loaderFile: 'loader.js',
    inputFiles: [
      '**/*.js'
    ],
    outputFile: '/index-set.js'
  });

  var tests = broccoli.makeTree('tests');
  tests = pickFiles(tests, {
    srcDir: '/',
    destDir: 'tests'
  });

  var testsJs = new broccoli.MergedTree([lib, vendor, tests]);
  testsJs = compileES6(testsJs, {
    loaderFile: 'loader.js',
    inputFiles: [
      '**/*.js'
    ],
    outputFile: '/index-set.js'
  });

  if (env === 'test') {
    libJs = testsJs;
  }

  return [publicTree, libJs];
};
