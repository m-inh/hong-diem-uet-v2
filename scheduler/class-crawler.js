'use strict';

const Mongoose = require('mongoose');
const async = require('async');

const Class = Mongoose.model('Class');

let services = require('../services');

services.classCrawler
    .crawlClasses()
    .then(classes => {
        async.each(classes,
            tempClass => {
                Class.findOneAndUpdate(
                    {code: tempClass.class_id, is_has_score: false},
                    {
                        is_has_score: true,
                        link: tempClass.link
                    },
                    {upsert: true})
                    .then(updatedClass => console.log(updatedClass))
                    .catch(err => console.log(err));
            },
            err => {
                console.log(err);
            });
    })
    .catch(err => console.log(err));