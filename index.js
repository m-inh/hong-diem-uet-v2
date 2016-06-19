/**
 * Created by TooNies1810 on 6/16/16.
 */
require('dotenv').config();
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var cheerio = require('cheerio');
var crypto = require('crypto');
var mysql = require('mysql');
var StringDecoder = require('string_decoder').StringDecoder;
var url = require('url');
var _ = require('lodash');
var validator = require('validator');
var checkParam = require('./check-param');
var BotK = require('./connect-bot');
var bot = new BotK();

var app = express();
app.use(bodyParser());
app.use(express.static(__dirname + '/public'));

var decoder = new StringDecoder('utf8');

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/public');
});

var url_host = "http://uetf.me/api";

var url_get_infor = "http://203.113.130.218:50223/congdaotao/module/dsthi_new/index.php";

var param = {
    keysearch: ""
};

var form = {
    url: url_get_infor,
    form: param
};

app.post('/api/register', function (req, res) {
    var re_capcha = req.body['g-recaptcha-response'];
    console.log(req);
    if (_.isEmpty(re_capcha)) {
        res.send('Re-capcha is not valid!');
        return;
    }

    var mssv = req.body.msv;
    var email = req.body.email;

    if (!validator.isEmail(email)) {
        res.status(404).end('Email is invalid!');
        return;
    }

    if (!checkParam.checkParamValidate(mssv) || !checkParam.checkParamValidate(email)) {
        res.status(404).end("Something went wrong!");
        return;
    }

    mssv = checkParam.validateParam(mssv);
    email = checkParam.validateParam(email);

    form.form.keysearch = mssv;

    postWithMssv(mssv, email, req, res);
});

app.get('/api/active/:token', function (req, res) {
    var token = req.params.token;
    console.log(token);

    if (!checkParam.checkParamValidate(token)) {
        res.end("Something went wrong!");
    }

    token = checkParam.validateParam(token);

    connection.query("SELECT * FROM user WHERE token = ?", [token], function (err, result) {
        if (err) {
            res.end("Something went wrong!");
        }
        if (result.length > 0) {
            connection.query("UPDATE user SET isactive = ? WHERE token = ?", [true, token], function (err, result) {
                if (err) {
                    res.end("Something went wrong!");
                } else {
                    res.end("Xac thuc thanh cong, cam on ban da su dung dich vu :D");
                }
            });
        } else {
            res.end("Something went wrong!");
        }
    });
});

app.get('/api/getInfor', function (req, res) {
    var url_parts = url.parse(req.url, true);
    var queries = url_parts.query;

    var mssv = queries.msv;
    if (_.isUndefined(mssv) || !checkParam.checkParamValidate(mssv)) {
        res.status(404).end();
        return;
    }

    if (mssv.length !== 8) {
        res.status(404).end();
        return;
    }

    var timetableArr = [];

    var student = {
        msv: mssv,
        name: '',
        qh: "lop",
        timetable: ''
    };

    form.form.keysearch = mssv;
    request.post(form, function (err, response, body) {
        if (err || response.statusCode != 200) {
            res.status(404).end("Something went wrong!");
            return;
        }

        // parser lop mon hoc
        var $ = cheerio.load(body, {
            decodeEntities: true
        });
        var trArr = $('tbody > tr');

        if (trArr.length <= 1) {
            res.status(404).end("Something went wrong!");
            return;
        }

        getNameLop(body, function (err, name, lop) {
            student.name = decoder.write(name);
            student.qh = lop;
            for (var i = 0; i < trArr.length; i++) {
                var trTemp = $(trArr[i]);
                var tdArr = trTemp.children('td');

                var chooseIdTd = $(tdArr[6]);
                var chooseNameTd = $(tdArr[7]);

                if (chooseIdTd.text().length != 0) {
                    var classId = chooseIdTd.text().toString().trim();
                    var className = chooseNameTd.text().toString().trim();
                    classId = classId.replace(" ", "");

                    var tempTimetable = {
                        code: classId,
                        name: className
                    };

                    timetableArr.push(tempTimetable);
                }
            }

            student.timetable = timetableArr;

            res.json(student);
        });

    });

});

app.post('/api/reactive', function (req, res) {
    var re_capcha = req.body['g-recaptcha-response'];
    if (_.isEmpty(re_capcha)) {
        res.send('Re-capcha is not valid!');
        return;
    }

    var email = req.body.email;

    if (!checkParam.checkParamValidate(email)) {
        res.status(404).end("Something went wrong!");
    }

    email = checkParam.validateParam(email);

    connection.query("SELECT * FROM user u WHERE u.email = ?", [email], function (err, results) {
        if (err) {
            res.end("Something went wrong!");
        }

        console.log(results);
        if (results.length == 0) {
            res.end("Email chua dang ki");
        } else {
            var link = url_host + "/active/" + results[0].token;
            sendEmailActive(results[0].name, "fries.uet@gmail.com", results[0].email, link, function (err) {
                if (err) {
                    res.end("Something went wrong!");
                } else {
                    res.end("Thanh cong roi day, check lai di :d");
                }
            });
        }
    });
});

app.get('/api/results', function (req, res) {

    var subjectArr = [];
    connection.query('SELECT * FROM class WHERE ishasscore = true', function (err, results) {
        if (err) {
            res.end("Some thing went wrong!");
        } else {
            for (var i = 0; i < results.length; i++) {
                var idClass = results[i].idclass;
                var nameClass = results[i].name;
                var link = results[i].link;

                var subject = {
                    id: idClass,
                    name: nameClass,
                    link: link
                };
                subjectArr.push(subject);
            }

            res.json(subjectArr);
        }
    });
});

app.get('/api/count', function (req, res) {
    console.log("ok count");
    connection.query("SELECT COUNT(*) AS countuser FROM user", function (err, results) {
        if (!err) {
            var countuser = results[0].countuser;
            connection.query("SELECT COUNT(*) AS countclass FROM class WHERE ishasscore = true", function (err, results) {
                if (!err) {
                    console.log(results);
                    var countclass = results[0].countclass;
                    var count = {
                        user: countuser,
                        class: countclass
                    };

                    res.json(count);
                } else {
                    res.status(404).end("Error");
                }
            });
        } else {
            res.status(404).end("Error");
        }

    })
});

/////////////////////////////////

function postWithMssv(mssv, email, req, res) {
    form.form.keysearch = mssv;

    //
    request.post(form, function (err, response, body) {

        if (err || response.statusCode != 200) {
            res.end("Something went wrong!");
            return;
        }

        // parser lop mon hoc
        var $ = cheerio.load(body, {
            decodeEntities: true
        });
        var trArr = $('tbody > tr');

        if (trArr.length <= 1) {
            // console.log("Khong ton tai mssv");
            res.status(404).end("Khong ton tai mssv");
            return;
        }

        getName(body, function (err, name) {
            if (!err) {
                crypto.randomBytes(48, function (err, buffer) {
                    var token = buffer.toString('hex');
                    console.log(token);

                    var userSql = {
                        id: '',
                        name: name,
                        email: email,
                        mssv: mssv,
                        isactive: false,
                        token: token
                    };

                    connection.query("INSERT INTO user SET ?", userSql, function (err, result) {
                        if (err) {
                            // console.log("Khong ton tai mssv");
                            console.log(err);
                            res.end("Email nay da co nguoi dang ki");
                        } else {
                            //Thanh cong
                            bot.newUser(userSql.mssv, userSql.email).end(function (res) {
                                console.log(res.body);
                            });

                            // response
                            var linkActive = url_host + "/active/" + token;
                            console.log('link: ' + linkActive);

                            sendEmailActive(name, "fries.uet@gmail.com", email, linkActive, function (err) {
                                if (err) {
                                    res.end("Something went wrong!");
                                } else {
                                    res.end("Check mail de hoan thanh nv!");

                                    for (var i = 0; i < trArr.length; i++) {
                                        var trTemp = $(trArr[i]);
                                        var tdArr = trTemp.children('td');

                                        var chooseTd = $(tdArr[6]);
                                        var chooseNameTd = $(tdArr[7]);

                                        if (chooseTd.text().length != 0) {
                                            var classId = chooseTd.text().toString().trim();
                                            classId = classId.replace(" ", "");
                                            classId = classId.toLowerCase();

                                            var className = chooseNameTd.text().toString().trim();
                                            if (classId.length > 0) {
                                                // console.log(classId);
                                                var classTemp = {
                                                    id: "",
                                                    idclass: classId,
                                                    name: className,
                                                    ishasscore: false
                                                };

                                                connection.query("INSERT INTO class SET ?", classTemp, function (err, result) {
                                                });

                                                var userClass = {
                                                    email: email,
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
                        }
                    });
                });
            }
        });
    });
}

//// send mail

function sendEmailActive(name, from, to, linkActive, callback) {

    var helper = require('sendgrid').mail;
    from_email = new helper.Email(from);
    to_email = new helper.Email(to);
    subject = "Xác nhận tài khoản";

    var content_html = "Xin chào " + name + "<br>" + "<br>" +
        "Chỉ còn 1 bước nữa là xong. Hãy click vào link dưới đây để hoàn tất." + "<br>" +
        "Link: " +
        "<a" + "href=" + linkActive + ">" + linkActive + "</a>" + "<br>" +
        "<strong>" + "Nếu không phải bạn hãy bỏ qua email này. " + "</strong>" +
        "Thân chào và quyết thắng!" + "<br>" +
        "Fries Team.";

    content = new helper.Content("text/html", content_html);
    mail = new helper.Mail(from_email, subject, to_email, content);

    var sg = require('sendgrid').SendGrid(process.env.SG_KEY);
    var requestBody = mail.toJSON();
    var request = sg.emptyRequest();
    request.method = 'POST';
    request.path = '/v3/mail/send';
    request.body = requestBody;
    sg.API(request, function (response) {
        // console.log(response.statusCode);
        // console.log(response.body);
        // console.log(response.headers);
        var err = true;
        if (response.statusCode == 202) {
            err = false;
            callback(err);
        } else {
            err = true;
            callback(err);
        }
    });
}


/////// connection

var connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("Connected to mysql!");

    app.listen(2345, function () {
        console.log("listening on 2345");
    });
});

// get name
function getNameLop(body, callback) {
    var $ = cheerio.load(body, {
        decodeEntities: true
    });

    var trArr = $('tbody > tr');
    var trTemp = $(trArr);
    var tdArr = trTemp.children('td');
    var chooseTd = $(tdArr[2]);
    var chooseLopTd = $(tdArr[4]);
    if (chooseTd.text().length != 0) {
        var name = chooseTd.text().toString().trim();
        var lop = chooseLopTd.text().toString().trim();
        callback(false, name, lop);
    }
}

function getName(body, callback) {
    var $ = cheerio.load(body, {
        decodeEntities: true
    });

    var trArr = $('tbody > tr');
    var trTemp = $(trArr);
    var tdArr = trTemp.children('td');
    var chooseTd = $(tdArr[2]);
    if (chooseTd.text().length != 0) {
        var name = chooseTd.text().toString().trim();
        callback(false, name);
    }
}
// ok men
//test