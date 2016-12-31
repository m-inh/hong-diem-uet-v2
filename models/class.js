'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Class = new Schema({
    code: {
        type: String,
        unique: true,
        require: true,
        trim: true
    },
    name: {
        type: String,
        trim: true
    },
    is_has_score: {
        type: Boolean,
        default: false
    }
});

mongoose.model('Class', Class);