'use strict';

const Mongoose = require('mongoose');
const async = require('async');

let Subscriber = Mongoose.model('Subscriber');
let SubscriberClass = Mongoose.model('SubscriberClass');
let services = require('../services');
let ResponseJSON = global.helpers.response;

const HOST_NAME = process.env.HOST_NAME;

module.exports.subscribe = (req, res) => {
    let msv = req.body.msv;
    let email = req.body.email;
    let name = req.body.name;

    if (msv.length != 8){
        return res.json(ResponseJSON().fail('Không tồn tại mã số sinh viên'));
    }

    Subscriber.findOne({email})
        .then(checkSubscriber => {
            if (checkSubscriber) return Promise.reject('Email đã có người đăng kí!');

            return services.studentCrawler.getInfoWithCode(msv);
        })
        .then(studentInfo => {
            let subscriber = new Subscriber({
                msv,
                email,
                name
            });

            subscriber
                .save().then(newSubscriber => {
                /**
                 * tempClassArr store data model objects save in mongoDb
                 * @type {Array}
                 */
                    let tempClassArr = [];
                    async.each(
                        studentInfo.subject_classes,
                        (tempClass, next) => {
                            let sub_class = new SubscriberClass({
                                class_id: tempClass.code.toLowerCase(),
                                subscriber_email: email
                            });

                            sub_class.save().then(newSubClass => {
                                tempClassArr.push(newSubClass);
                                next();
                            }).catch(err => next(err));
                        },
                        err => {
                            if (err) return res.json(ResponseJSON().fail(err));

                            /**
                             * push each subject_class to subscriber
                             * finally, call save()
                             */
                            for (let tempClass of tempClassArr){
                                newSubscriber.subject_classes.push(tempClass);
                            }
                            newSubscriber.save()
                                .then(pushedClass => {
                                    console.log(pushedClass);

                                    // send email active
                                    let linkActive = HOST_NAME + `/api/subscriber/active/${newSubscriber.token}`;
                                    services.email.sendEmailActive(newSubscriber.email, newSubscriber.name, linkActive)
                                        .catch(err => console.log('Email fail: ' + newSubscriber.email));

                                    return res.json(ResponseJSON('Đăng kí thành công, xác nhận email tại hòm thư để hoàn tất!', newSubscriber));
                                })
                                .catch(err => console.log(err));
                        });
                }
            ).catch((err) => {
                console.log(err);
                return res.json(ResponseJSON().fail(err));
            });
        }
    ).catch(error => {
        console.log(error);
        return res.json(ResponseJSON().fail(error));
    });
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
            return services.email.sendEmailActive(subscriber.email, subscriber.name, linkActive);
        })
        .then(msg => {
            res.send(msg);
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
            return subscriber.save();
        })
        .catch(err => {
            return console.log(err);
        })
        .then(activeSuber => {
            console.log(activeSuber);
            return res.send('Kích hoạt thành công');
        })
        .catch(err => {
            return res.send('Something went wrong!');
        });
};

module.exports.count = (req, res) => {
    Subscriber.count({})
        .then(numb => res.json(ResponseJSON('Success', {numb_of_subscriber: numb})))
        .catch(err => res.json(ResponseJSON().fail(err)));
};