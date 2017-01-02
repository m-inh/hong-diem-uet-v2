'use strict';

const request = require('request');
const cheerio = require('cheerio');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
let url_get_infor = "https://112.137.129.87/congdaotao/module/dsthi_new/index.php";

module.exports.getInfoWithCode = function (mssv) {
    return new Promise((resolve, reject) => {
        if (mssv.length < 8) {
            return reject('Mã số sinh viên không đúng');
        }

        let form = {
            url: url_get_infor,
            form: {
                keysearch: mssv
            }
        };

        request.post(form, function (err, response, bodyHtml) {
            if (err || response.statusCode != 200) {
                return reject(err);
            }

            parseStudentInfo(bodyHtml)
                .then(studentInfo => {
                    return resolve(studentInfo);
                })
                .catch(err => {
                    return reject(err);
                });
        });
    });
};

function parseStudentInfo(bodyHtml) {
    return new Promise((resolve, reject) => {
        let $ = cheerio.load(bodyHtml, {
            decodeEntities: true
        });

        let trArr = $('tbody > tr');
        if (trArr.length <= 1) {
            return reject('Không tồn tại sinh viên này, vui lòng thử lại!');
        }

        let trTemp = $(trArr);
        let tdArr = trTemp.children('td');
        let chooseNameTd = $(tdArr[2]);
        let chooseBirthTd = $(tdArr[3]);
        let chooseLopTd = $(tdArr[4]);

        if (chooseNameTd.text().length != 0) {
            let name = chooseNameTd.text().toString().trim();
            let birth = chooseBirthTd.text().toString().trim();
            let regular_class = chooseLopTd.text().toString().trim();
            let subject_classes = [];

            for (let i = 0; i < trArr.length; i++) {
                let trTemp = $(trArr[i]);
                let tdArr = trTemp.children('td');

                let chooseIdTd = $(tdArr[6]);
                let chooseNameTd = $(tdArr[7]);

                let classId = chooseIdTd.text().toString().trim();
                let className = chooseNameTd.text().toString().trim();
                classId = classId.replace(" ", "");

                let subjectClassTemp = {
                    code: classId,
                    name: className
                };

                subject_classes.push(subjectClassTemp);
            }

            resolve({
                name: name,
                birth: birth,
                regular_class: regular_class,
                subject_classes: subject_classes
            });
        } else {
            reject('parse fail');
        }
    });
}