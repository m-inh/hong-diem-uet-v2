'use strict';

const Mongoose = require('mongoose');
const Student = Mongoose.model('Student');

module.exports.getInfo = (req, res) => {
    Student.getStudentByCode(req.params.msv)
        .then(student => {
            res.json(student);
        })
        .catch(err => {
            res.json({error: true, msg: err});
        });
};