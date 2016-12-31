'use strict';

const services = require('../services');

module.exports.getInfo = (req, res) => {
    services.studentCrawler.getInfoWithMssv(req.params.msv)
        .then(student => {
            return res.json(student);
        })
        .catch(err => {
            return res
                .status(400)
                .json({error: true, msg: err});
        });
};