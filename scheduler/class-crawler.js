'use strict';

require('dotenv').config();
const async = require('async');

global.helpers = require('../helpers');
let services = require('../services');
const mongodb = require('../mongoose');

mongodb()
    .then(
        message => {
            console.log(message);
            return services.classCrawler.crawlClasses();
        }
    )
    .catch(error => console.log(error))
    .then(classes => {
        console.log(classes);
        const Mongoose = require('mongoose');
        const Class = Mongoose.model('Class');

        async.each(classes,
            (tempClass, next) => {
                let query = {code: tempClass.class_id},
                    update = {
                        name: tempClass.name,
                        is_has_score: true,
                        link: tempClass.link
                    },
                    options = {upsert: true, new: true, setDefaultsOnInsert: true};

                Class.findOneAndUpdate(
                    query,
                    update,
                    options)
                    .then(updatedClass => {
                        console.log(updatedClass);

                        next();
                    })
                    .catch(err => {
                        console.log(err);

                        next(err);
                    });
            },
            err => {
                console.log(err);
            });
    })
    .catch(err => console.log(err));