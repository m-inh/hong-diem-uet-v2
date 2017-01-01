'use strict';

/**
 * Mail-sender check class and subscriber to send email
 */

require('dotenv').config();
const async = require('async');

global.helpers = require('../helpers');
let services = require('../services');
const mongodb = require('../mongoose');

mongodb()
    .then(
        message => {
            console.log(message);
            const Mongoose = require('mongoose');
            const Class = Mongoose.model('Class');
            const Subscriber = Mongoose.model('Subscriber');

            let dataHolder = {};

            // Fetch data
            Subscriber
                .find({is_active: true})
                .populate('subject_classes')
                .exec()
                .then(subscribers => {
                    dataHolder.subscribers = subscribers;

                    return Class.find({is_has_score: true}).exec();
                })
                .then(classes => {
                    dataHolder.classes = classes;

                    checkSubscribers(dataHolder);
                })
                .catch(err => console.log(err));

        }
    )
    .catch(error => console.log(error));

function checkSubscribers(dataHolder) {
    for (let subscriber of dataHolder.subscribers) {
        checkEachSubscriber(subscriber, dataHolder.classes);
    }
}

function checkEachSubscriber(subscriber, classHasScores) {
    async.each(subscriber.subject_classes,
        (temClass, next) => {
            for (let tempClassScore of classHasScores){
                // console.log(temClass);
                // console.log(classHasScores);
                if (tempClassScore.code == temClass.class_id){
                    // send mail and next()
                    console.log(tempClassScore);
                    console.log('--------------');
                }
            }
            next();
        },
        err => {
            console.log(err);
        });
}