'use strict';

const async = require('async');

let services = require('../services');
const Mongoose = require('mongoose');
const Class = Mongoose.model('Class');

module.exports = function () {
    services.classCrawler.crawlClasses()
        .then(classes => {
            // console.log(classes);

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
                            // console.log(updatedClass);

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
};