var fs = require("fs");
var esp = require('esprima');
var primitive = 'iniitif'+'.txt';
var code = 'i=0;'
fs = require('fs');
fs.writeFile(primitive, JSON.stringify(esp.parse(code)), function(err){console.log(err)});