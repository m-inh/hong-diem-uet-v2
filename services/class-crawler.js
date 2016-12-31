'use strict';

const request = require('request');
const cheerio = require('cheerio');

const url_host = "http://www.coltech.vnu.edu.vn";
const url_test = "http://www.coltech.vnu.edu.vn/news4st/test.php";

module.exports.crawlClasses = function () {
    return new Promise((resolve, reject) => {

        let postPayload = {
            url: url_test,
            form: {
                "lstClass": "820"
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
                if (nameTemp.length > 1) {
                    nameTemp2 = nameTemp[0].split('-')[0].trim();
                } else {
                    nameTemp2 = nameTemp.split('-')[0].trim();
                }

                let idClass = removeUndeline(getIdClass(url_temp));
                if (idClass.length > 0) {
                    if (idClass.length > 8) {
                        idClass = idClass.substring(0, 8);
                    }

                    let tempClass = {
                        class_id: idClass,
                        name: nameTemp2,
                        link: url_temp
                    };

                    classes.push(tempClass);
                    // INSERT INTO class SET ?

                    // UPDATE class SET ishasscore = ?, link = ? WHERE idclass = ?
                }

            }

            return resolve(classes);
        });
    })
};

function removeUndeline(string) {
    string = string.toString().trim();
    return string.split('_').join('');
}

function getIdClass(url) {
    let urlString = url.toString();
    let url1 = urlString.split('-');

    if (url1.length == 2) {
        return url1[1].substring(0, url1[1].length - 4);
    }

    if (url1.length > 2) {
        let tempUrl = url1[url1.length - 1];
        return tempUrl.substring(0, tempUrl.length - 4);
    }

    if (url1.length == 0) {
        url1 = urlString.split('/');
        let nameTemp = url1[url1.length - 1];
        return nameTemp.substring(0, nameTemp.length - 4);
    }

    return '';
}