'use strict';

const Mongoose = require('mongoose');

let Class = Mongoose.model('Class');
let ResponseJSON = global.helpers.response;

module.exports.list = (req, res) => {
    Class.find({is_has_score: true})
        .then(classes => res.json(ResponseJSON('Success', {classes})))
        .catch(err => res.json(ResponseJSON().fail(err)));
};

module.exports.count = (req, res) => {
    Class.count({})
        .then(numb => res.json(ResponseJSON('Success', {numb_of_class: numb})))
        .catch(err => res.json(ResponseJSON().fail(err)));
};
