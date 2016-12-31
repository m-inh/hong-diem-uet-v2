'use strict';

const crypto = require('crypto');

module.exports.generateToken = () => {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(48, (err, buffer) => {
            if (err) {
                return reject(err);
            }

            return resolve(buffer.toString('hex'));
        })
    });
};