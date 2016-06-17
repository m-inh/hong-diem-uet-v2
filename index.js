/**
 * Created by TooNies1810 on 6/16/16.
 */
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var cheerio = require('cheerio');
var crypto = require('crypto');
var mysql = require('mysql');

var app = express();
app.use(bodyParser());
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/public');
});

var url_host = "too.com:2345";

var url_get_infor = "http://203.113.130.218:50223/congdaotao/module/dsthi_new/index.php";

var param = {
    keysearch: ""
};

var form = {
    url: url_get_infor,
    form: param
};

app.post('/register', function (req, res) {
    var mssv = req.body.mssv;
    var email = req.body.email;
    form.form.keysearch = mssv;

    postWithMssv(mssv, req, res);
});

app.get('/active/:token', function (req, res) {
    var token = req.params.token;
    console.log(token);
    connection.query("SELECT * FROM user WHERE token = ?", [token], function (err, result) {
        if (err) {
            res.end("Something went wrong!");
        }
        if (result.length > 0) {
            connection.query("UPDATE user SET isactive = ? WHERE token = ?", [true, token], function (err, result) {
                if (err) {
                    res.end("Something went wrong!");
                } else {
                    res.end("Active thanh cong");
                }
            });
        }
    });
});

function postWithMssv(mssv, req, res) {
    form.form.keysearch = mssv;

    //
    request.post(form, function (err, response, body) {

        if (err || response.statusCode != 200) {
            return;
        }

        // parser lop mon hoc
        var $ = cheerio.load(body, {
            decodeEntities: true
        });
        var trArr = $('tbody > tr');

        if (trArr.length <= 1) {
            console.log("Khong ton tai mssv");
            return;
        }

        crypto.randomBytes(48, function (err, buffer) {
            var token = buffer.toString('hex');
            console.log(token);

            var userSql = {
                id: '',
                email: req.body.email,
                mssv: req.body.mssv,
                isactive: false,
                token: token
            };

            connection.query("INSERT INTO user SET ?", userSql, function (err, result) {
                if (err) {
                    // console.log("loi cmnr");
                } else {
                    // response
                    var linkActive = url_host + "/active/" + token;
                    console.log('link: ' + linkActive);
                    res.end("Check mail de hoan thanh nv!");

                    // send mail


                    for (var i = 0; i < trArr.length; i++) {
                        var trTemp = $(trArr[i]);
                        var tdArr = trTemp.children('td');

                        var chooseTd = $(tdArr[6]);

                        if (chooseTd.text().length != 0) {
                            var classId = chooseTd.text().toString().trim();
                            classId = classId.replace(" ", "");
                            classId = classId.toLowerCase();
                            if (classId.length > 0) {
                                // console.log(classId);
                                var classTemp = {
                                    id: "",
                                    idclass: classId,
                                    name: '',
                                    ishasscore: false
                                };

                                connection.query("INSERT INTO class SET ?", classTemp, function (err, result) {
                                });

                                var userClass = {
                                    email: req.body.email,
                                    idclass: classId,
                                    issendmail: false
                                };

                                // user-class
                                connection.query("INSERT INTO user_class SET ?", userClass, function (err, result) {
                                });
                            }
                        }
                    }
                }
            });
        });
    });
}


/////// connection

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'score-uet'
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("Connected to mysql!");

    app.listen(2345, function () {
        console.log("listening on 2345");
    });
});