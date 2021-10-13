var debug = require('debug')('objectify-folder');
var fs = require('fs');
var glob = require('glob');
var path = require('path');

module.exports = function (options) {

  if (typeof options === 'string') {
    options = {
      path: options
    };
  }

  if ( ! options.path) throw new Error('objectify-folder requires a string dir path or an options param with a path property.');

  if ( ! options.fn) {
    var index = 0;
    options.fn = function (mod, result, file) {
      var basename = path.basename(file, '.js');
      result[basename] = mod;
    };
  }

  var globbing = (options.path.indexOf('*') > -1 );

  var files = globbing ? glob.sync(options.path) : fs.readdirSync(options.path);

  var result = {};

  files.forEach(function (file) {

    if (file === 'index.js' || file === '.DS_Store' || file.includes('.d.ts') || file.includes('.map')) return;
    
    var mod;

    var filepath = globbing ? path.resolve(file) : path.resolve(path.join(options.path, file));

    try {
      mod = require(filepath);
    } catch (err) {
      if (fs.lstatSync(filepath).isDirectory()) return;
      throw err;
    }
    options.fn(mod, result, file);
  });

  return result;

};