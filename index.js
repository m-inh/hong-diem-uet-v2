/**
 * Created by TooNies1810 on 6/16/16.
 */
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var cheerio = require('cheerio');
var crypto = require('crypto');
var mysql = require('mysql');
var StringDecoder = require('string_decoder').StringDecoder;
var url = require('url');
var _ = require('lodash');

var app = express();
app.use(bodyParser());
app.use(express.static(__dirname + '/public'));

var decoder = new StringDecoder('utf8');

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/public');
});

var url_host = "188.166.233.156:2345";

var url_get_infor = "http://203.113.130.218:50223/congdaotao/module/dsthi_new/index.php";

var param = {
    keysearch: ""
};

var form = {
    url: url_get_infor,
    form: param
};

app.post('/api/register', function (req, res) {
    var mssv = req.body.msv;
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
    if (_.isUndefined(mssv)) {
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

function postWithMssv(mssv, req, res) {
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
                        email: req.body.email,
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
                            // response
                            var linkActive = url_host + "/active/" + token;
                            console.log('link: ' + linkActive);

                            sendEmailActive(name, "fries.uet@gmail.com", req.body.email, linkActive, function (err) {
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

    var sg = require('sendgrid').SendGrid("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");
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
var temp_pass = "cBHdYiWf";

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'score_uet'
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

// test//

// app.listen(2345, function () {
//     console.log("listening on 2345");
// });