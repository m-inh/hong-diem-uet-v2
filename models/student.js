'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Student = new Schema({
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
    birthday: {
        type: String
    },
    regular_class: {
        type: String,
        trim: true
    },
});

mongoose.model('Student', Student);