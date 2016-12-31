'use strict';

class ResponseJSON {
    constructor(msg = '', data = {}, err = false, code = 200) {
        this.code = code;
        this.err = err;
        this.msg = msg;
        this.data = data;
    }

    undefined() {
        this.err = true;
        this.code = 400;
        this.msg = this.msg || 'Đã có lỗi xảy ra!';
        return this;
    }

    success(msg) {
        this.err = false;
        this.msg = this.msg || msg || 'Success';
        return this;
    }

    fail(msg) {
        this.err = true;
        this.code = 400;
        this.msg = this.msg || msg || 'Fail';
        return this;
    }
}

module.exports = function (msg, data, err, code) {
    return new ResponseJSON(msg, data, err, code);
};