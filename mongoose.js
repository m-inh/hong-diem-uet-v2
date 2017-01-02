'use strict';

const Mongoose = require('mongoose');
const Glob = require('glob');

let enableCache = process.env.ENABLE_CACHE || false;
if (enableCache) {
    const cachegoose = require('cachegoose');
    cachegoose(Mongoose, {
        engine: 'redis',
        port: 6379,
        host: 'localhost'
    });
}

module.exports = () => {
    return new Promise((resolve, reject) => {
        let mongoUri = process.env.MONGODB_URI || 'localhost:27017';

        Mongoose.Promise = global.Promise;
        Mongoose.connect(mongoUri, function (err) {
            if (err) {
                console.log(err);
                throw err;
            }
        });

        // If the node process ends, close the mongoose connection
        process.on('SIGINT', function () {
            Mongoose.connection.close(function () {
                console.log('Mongo Database disconnected through app termination');
                process.exit(0);
            });
        });

        // When the connection is disconnected
        Mongoose.connection.on('connected', function () {
            resolve('Mongo Database connected');
        });

        // When the connection is disconnected
        Mongoose.connection.on('disconnected', function () {
            reject(' Mongo Database disconnected');
        });

        // Load models
        let models = Glob.sync('models/*.js');
        models.forEach(function (model) {
            require('./' + model);
        });
    });
};