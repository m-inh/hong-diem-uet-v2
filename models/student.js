'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Q = require('q');
const studentCrawler = require('../services/student-crawler');

let Student = new Schema({
    code: {
        type: String,
        unique: true,
        index: true,
        require: true
    },
    name: {
        type: String
    },
    birthday: {
        type: String
    },
    regular_class: {
        type: String
    },
    subject_classes: {
        type: [Schema.Types.Mixed]
    },
    crawl_at: {
        type: Number
    }
});

Student.statics.getStudentByCode = function (code) {
    let deferred = Q.defer();

    this.findOne({code: code})
        .then(
            student => {
                if (student) {
                    return deferred.resolve(student);
                }

                crawlAndSave(code)
                    .then(
                        student_ => {
                            deferred.resolve(student_);
                        }
                    )
                    .catch(
                        error => deferred.reject(error)
                    );
            }
        )
        .catch(
            error => {
                deferred.reject(error);
            }
        );

    return deferred.promise;
};

function crawlAndSave(code) {
    let deferred = Q.defer();

    studentCrawler.getInfoWithCode(code)
        .then(
            info => {
                /**
                 * Store student to database.
                 */
                let Student_ = mongoose.model('Student');
                let student_ = new Student_(info);
                student_.save();

                deferred.resolve(info);
            }
        )
        .catch(
            error => {
                deferred.reject(error);
            }
        );

    return deferred.promise;
}

let handleE11000 = function (error, next) {
    if (error.name === 'MongoError' && error.code === 11000) {
        next('Student already existed');
    } else {
        next();
    }

};

Student.post('save', handleE11000);

mongoose.model('Student', Student);
