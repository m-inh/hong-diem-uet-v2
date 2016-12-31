'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let SubscriberClass = new Schema({
    class_id: {
        type: String,
        require: true
    },
    subscriber_id: {
        type: String,
        require: true
    },
    is_send_mail: {
        type: Boolean,
        default: false
    }
});

mongoose.model('SubscriberClass', SubscriberClass);