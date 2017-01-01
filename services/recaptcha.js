require('dotenv').config();

let recaptcha = require('nodejs-nocaptcha-recaptcha');
let recaptcha_key = process.env.GG_RECAPTCHA_KEY;

function recaptcha_verify(req, res, next) {
    let recaptcha_post = req.body['g-recaptcha-response'];

    recaptcha(recaptcha_post, recaptcha_key, function (success) {
        if (success) {
            next();
            return;
        }

        res.json({
            return: false,
            msg: 'Captcha is invalid!'
        });
    });
}

module.exports = recaptcha_verify;