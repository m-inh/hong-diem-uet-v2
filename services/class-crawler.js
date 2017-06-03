'use strict';

const request = require('request');
const cheerio = require('cheerio');
const async = require('async');

const url_host = "http://www.coltech.vnu.edu.vn";
const url_test = "http://www.coltech.vnu.edu.vn/news4st/test.php";
const LIST_ID_SEMESTER = ['825'];

/**
 * 823 (HK I 2016-2017), 822 (HK II 2015-2016 - Kỳ thi phụ)
 * @param idSemester
 * @returns {Promise}
 */

function crawlClassesById(idSemester) {
    return new Promise((resolve, reject) => {

        let postPayload = {
            url: url_test,
            form: {
                "lstClass": idSemester
            }
        };

        request.post(postPayload, function (err, response, bodyHtml) {
            if (err || response.statusCode !== 200) {
                return reject(err);
            }

            let classes = [];

            let $ = cheerio.load(bodyHtml);

            let urlArr = $('a');
            let nameArr = $('b');

            for (let i = 0; i < urlArr.length; i++) {
                let url_temp = url_host + urlArr[i].attribs.href.toString().trim().substring(2);
                let nameClass = $(nameArr[i]).text().trim();

                let nameTemp = nameClass.split('(');
                let nameTemp2 = "";
                let idClass = '';
                if (nameTemp.length > 1 && nameTemp[0].split('-').length > 1) {
                    let tempArr = nameTemp[0].split('-');
                    idClass = tempArr.pop().trim().split(' ').join('').toLowerCase();
                    nameTemp2 = tempArr.join(' - ').trim();
                }

                if (idClass.length > 0) {
                    let tempClass = {
                        class_id: idClass,
                        name: nameTemp2,
                        link: url_temp
                    };
                    classes.push(tempClass);
                }
            }
            return resolve(classes);
        });
    })
}

module.exports.crawlClasses = function () {
    let tempClasses = [];

    return new Promise((resolve, reject) => {
        async.each(
            LIST_ID_SEMESTER,
            (idSemester, next) => {
                crawlClassesById(idSemester)
                    .then(
                        classes => {
                            tempClasses = tempClasses.concat(classes);

                            next();
                        }
                    ).catch(err => next(err));
            },
            err => {
                if (err) return reject(err);
                return resolve(tempClasses);
            }
        )
    })
};