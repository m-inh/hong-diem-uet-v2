'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Class = new Schema({
    code: {
        type: String,
        // unique: true,
        trim: true
    },
    name: {
        type: String,
        trim: true
    },
    is_has_score: {
        type: Boolean,
        default: false
    },
    link: {
        type: String,
        trim: true
    },
});

mongoose.model('Class', Class);