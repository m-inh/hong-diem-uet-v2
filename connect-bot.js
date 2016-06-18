'use strict';

module.exports = class BotK {

    constructor() {
        this.data = new ResponseK();
        this.host = 'http://128.199.223.91:8080/uetbot/api?apiKey=roseisred_violetisblue_uet14020577';
        this.request = require('unirest');
    }

    newUser(msv, email) {
        var data = this.data.newUser(msv, email);

        return this.createRequest().send(data);
    }

    hasScore(name, code, link, members) {
        var data = this.data.hasScore(name, code, link, members);

        return this.createRequest(data)
    }

    createRequest(data) {
        return this.request.post(this.host)
            .type('json').send(data);
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

    hasScore(name, code, link, members) {
        return {
            type: 'newgrade',
            course_name: name,
            course_code: code,
            grade_link: link,
            members: members
        }
    }
}