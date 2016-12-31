'use strict';

const Mongoose = require('mongoose');

let Subscriber = Mongoose.model('Subscriber');
let services = require('../services');
let ResponseJSON = global.helpers.response;

const HOST_NAME = process.env.HOST_NAME;

module.exports.subscribe = (req, res) => {
    // @todo validate
    let msv = req.body.msv;
    let email = req.body.email;
    let name = req.body.name;

    Subscriber
        .findOne({email})
        .then(checkSubscriber => {
            if (checkSubscriber) return res.json(ResponseJSON().fail('Email đã có người đăng kí!'));

            let subscriber = new Subscriber({
                msv,
                email,
                name
            });

            subscriber
                .save()
                .then(newSubscriber => {
                    let linkActive = HOST_NAME + `/api/subscriber/active/${newSubscriber.token}`;
                    services.email.sendEmailActive(newSubscriber.email, newSubscriber.name, linkActive)
                        .then(msg => {})
                        .catch(err => console.log('Email fail: ' + newSubscriber.email));

                    delete newSubscriber.token;
                    res.json(ResponseJSON('Đăng kí thành công', newSubscriber));
                })
                .catch(error => res.json(ResponseJSON().fail(error)));
        })
        .catch(err => res.json({err: true, msg: 'Something went wrong'}));
};

module.exports.unSubscribe = (req, res) => {

};

module.exports.reactive = (req, res) => {
    let email = req.body.email;
    Subscriber.findOne({email})
        .then(subscriber => {
            if (!subscriber) return res.send('Email không tồn tại!');
            if (subscriber.is_active) return res.send('Email đã được kích hoạt');

            let linkActive = HOST_NAME + `/api/subscriber/active/${subscriber.token}`;
            services.email.sendEmailActive(subscriber.email, subscriber.name, linkActive)
                .then(msg => {
                    res.send(msg);
                })
                .catch(err => {
                    res.send(err);
                })
        })
        .catch(err => {
            console.log(err);
            res.send(err);
        });
};

module.exports.active = (req, res) => {
    let token = req.params.token;

    Subscriber.findOne({token})
        .then(subscriber => {
            if (!subscriber) return res.send('Đã có lỗi xảy ra');
            if (subscriber.is_active) return res.send('Email đã được kích hoạt');

            subscriber.is_active = true;
            subscriber.save()
                .then(activeSuber => {
                    console.log(activeSuber);
                    return res.send('Kích hoạt thành công');
                })
                .catch(err => {
                    return res.send('Something went wrong!');
                });
        })
        .catch(err => {
            return console.log(err);
        });
};

module.exports.count = (req, res) => {
    Subscriber.count({})
        .then(numb => res.json(ResponseJSON('Success', {numb_of_subscriber: numb})))
        .catch(err=> res.json(ResponseJSON().fail(err)));
};