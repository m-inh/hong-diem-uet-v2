'use strict';

const cproc = require('child_process');

cproc.fork(__dirname + '/../child_process/student-crawler');