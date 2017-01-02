'use strict';

require('dotenv').config();
const async = require('async');
const Mongoose = require('mongoose');

global.helpers = require('./helpers');
let services = require('./services');
const mongodb = require('./mongoose');

let START_CODE = 16020010;
let NUMBER_OF_THREAD = 80;

let currNumbOfStudent = 0;

function crawlStudentInfo(startCode, numbOfStudent, numbOfThread) {
    let params = [];
    for (let i = 0; i < numbOfThread; i++) {
        params.push(startCode + i);
    }

    execParallel(services.studentCrawler.getInfoWithMssv, params)
        .then(
            studentArr => {
                // console.log(studentArr);
                // console.log(startCode);
                console.log(currNumbOfStudent);

                // save to DB
                saveStudentInfoToDb(studentArr);

                // next section
                currNumbOfStudent += numbOfThread;
                let lastCodeOfThisSec = startCode += numbOfThread;

                if (currNumbOfStudent < numbOfStudent)
                    crawlStudentInfo(lastCodeOfThisSec, numbOfStudent, numbOfThread);
            }
        )
        .catch(
            err => console.log()
        );
}

function execParallel(func, params) {
    let results = [];

    return new Promise((resolve, reject) => {
        async.each(params,
            (param, next) => {
                console.log(param);

                func(param)
                    .then(result => {
                        results.push(result);

                        next();
                    })
                    .catch(err => next());
            },
            err => {
                if (err) return reject(err);

                return resolve(results);
            })
    });
}

function saveStudentInfoToDb(studentArr) {
    async.each(
        studentArr,
        (studentInfo, next) => {
            let student = new Student(studentInfo);

            student.save()
                .then(
                    newStudent => {
                        console.log(newStudent);

                        next();
                    }
                )
                .catch(err => {
                    console.log(err);

                    next();
                });
        },
        err => {
            if (err) console.log(err);
        }
    );
}

let Subscriber;
let Student;

mongodb().then(
    message => {
        console.log(message);

        Subscriber = Mongoose.model('Subscriber');
        Student = Mongoose.model('Student');

        crawlStudentInfo(START_CODE, 500, NUMBER_OF_THREAD);

    }
).catch(error => console.log(error));
