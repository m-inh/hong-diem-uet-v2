module.exports = class BotK {
    private host = 'http://128.199.223.91:8080/uetbot/api?apiKey=roseisred_violetisblue_uet14020577';
    private request = require('unirest');
    public response;

    public Bot() {
        this.response = new ResponseK();
    }

    public newUser(msv, email) {
        var response = this.response.newUser(msv, email);

        return request.post(this.host)
            .type('json')
            .send(response);
    }
};

class ResponseK {
    var md5 = require('md5');

    public static newUser(msv, email) {
        return response = {
            type: 'newuser',
            mssv: msv,
            token: md5(email)
        };
    }

    public static hasScore() {
        return {
            type: 'newgrade',
            course_name: '',
            course_code: '',
            grade_link: 'a',
            members: []
        }
    }
}