'use strict';

const fs = require('fs');
const util = require('util');
let logFile = fs.createWriteStream(__dirname + '/../log', { flags: 'a' });
// Or 'w' to truncate the file every time the process starts.
let logStdout = process.stdout;

global.log = function () {
    logFile.write(util.format.apply(null, arguments) + '\n');
    logStdout.write(util.format.apply(null, arguments) + '\n');
};