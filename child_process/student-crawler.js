'use strict';

require('dotenv').config();
const async = require('async');
const Mongoose = require('mongoose');

global.helpers = require('./../helpers');
console.log = global.log;
let services = require('./../services');
const mongodb = require('./../mongoose');

let START_CODE_ARRAY = [13020000, 14020000, 15020000, 16020000];
let NUMBER_OF_THREAD = 2;
let NUMBER_OF_STUDENT = 1;

let currNumbOfStudent = 0;

function crawlStudentInfo(startCode, numbOfStudent, numbOfThread) {
    let params = [];
    for (let i = 0; i < numbOfThread; i++) {
        params.push(startCode + i);
    }

    execParallel(services.studentCrawler.getInfoWithCode, params)
        .then(
            studentArr => {
                // console.log(studentArr);
                // console.log(startCode);
                console.log(currNumbOfStudent);

                // save to DB
                saveStudentInfoToDb(studentArr);

                // next section
                currNumbOfStudent += numbOfThread;
                let lastCodeOfThisSec = startCode + numbOfThread;

                if (currNumbOfStudent < numbOfStudent)
                    crawlStudentInfo(lastCodeOfThisSec, numbOfStudent, numbOfThread);
                else if (START_CODE_ARRAY.length > 0) {
                    // crawl another K
                    currNumbOfStudent = 0;
                    crawlStudentInfo(START_CODE_ARRAY.pop(), NUMBER_OF_STUDENT, NUMBER_OF_THREAD);
                } else {
                    console.log('------------crawl done----------');

                    // exit crawler
                    // process.exit(1);
                    Mongoose.connection.close();
                }
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
                    // console.log(err);

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

        crawlStudentInfo(START_CODE_ARRAY.pop(), NUMBER_OF_STUDENT, NUMBER_OF_THREAD);

    }
).catch(error => console.log(error));
