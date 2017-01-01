'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let SubjectClass = new Schema({
    code: {
        type: String,
        // unique: true,
    },
    name: {
        type: String
    },
    is_has_score: {
        type: Boolean,
        default: false
    },
    link: {
        type: String
    },
});

mongoose.model('Class', SubjectClass);