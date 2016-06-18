'use strict';

module.exports = class BotK {

    constructor() {
        this.host = 'http://128.199.223.91:8080/uetbot/api?apiKey=roseisred_violetisblue_uet14020577';
        this.request = require('unirest');
    }

    newUser(msv, email) {
        var data = DataK.newUser(msv, email);

        return this.createRequest().send(data);
    }

    createRequest(data) {
        return this.request.post(this.host)
            .type('json').send(data);
    }
};

class DataK {
    static newUser(msv, email) {
        var md5 = require('md5');

        return {
            type: 'newuser',
            mssv: msv,
            token: md5(email)
        };
    }
}