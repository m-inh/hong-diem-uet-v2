'use strict';

const express = require('express');
const router = express.Router();
const controllers = require('./controllers');

module.exports = router
    // Subscriber
    .post('/subscriber', controllers.subscriber.subscribe)
    .delete('/subscriber', controllers.subscriber.unSubscribe)
    .post('/subscriber/reactive', controllers.subscriber.reactive)
    .get('/subscriber/active/:token', controllers.subscriber.active)
    .get('/subscriber/count', controllers.subscriber.count)

    // Students
    .get('/student/:msv', controllers.student.getInfo)

    //Classes
    .get('/class', controllers.class.list)
    .get('/class/count', controllers.class.count);