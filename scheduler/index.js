'use strict';

let classCrawler = require('./class-crawler');
let mailChecker = require('./mail-sender');

// const TIME_SCHEDULE = 5 * 60 * 1000; // 5 minutes
const TIME_SCHEDULE = 60 * 1000; // 5 minutes

setInterval(() => {
    console.log('schedule');
    classCrawler();
    mailChecker();

}, TIME_SCHEDULE);