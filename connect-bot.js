'use strict';

module.exports = class BotK {

    constructor() {
        this.response = new ResponseK();
        this.host = 'http://128.199.223.91:8080/uetbot/api?apiKey=roseisred_violetisblue_uet14020577';
        this.request = require('unirest');
    }

    newUser(msv, email) {
        var response = this.response.newUser(msv, email);

        return this.request.post(this.host)
            .type('json')
            .send(response);
    }
};

class ResponseK {
    newUser(msv, email) {
        var md5 = require('md5');

        return {
            type: 'newuser',
            mssv: msv,
            token: md5(email)
        };
    }

    hasScore() {
        return {
            type: 'newgrade',
            course_name: '',
            course_code: '',
            grade_link: 'a',
            members: []
        }
    }
}