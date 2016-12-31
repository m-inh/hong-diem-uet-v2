/**
 * Created by TooNies1810 on 6/16/16.
 */
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
let express = require('express');
let bodyParser = require('body-parser');
let request = require('request');
let cheerio = require('cheerio');
let crypto = require('crypto');
let mysql = require('mysql');
let StringDecoder = require('string_decoder').StringDecoder;
let url = require('url');
let _ = require('lodash');
let validator = require('validator');
let checkParam = require('./check-param');
let BotK = require('./connect-bot');
let bot = new BotK();

let app = express();
app.use(bodyParser());
app.use(express.static(__dirname + '/public'));

const routes = require('./routes');
app.use('/api', routes);

const mongodb = require('./mongoose');
mongodb()
    .then(
        (message) => {
            console.log(message);

            const PORT = process.env.PORT || 2345;
            app.listen(PORT, () => {
                console.log(`Listening on ${PORT}`);
            });
        }
    )
    .catch(
        error => {
            console.log(error);
        }
    );


let decoder = new StringDecoder('utf8');

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/public');
});

let url_host = "http://uetf.me/api";

let url_get_infor = "https://112.137.129.87/congdaotao/module/dsthi_new/index.php";

let param = {
    keysearch: ""
};

let form = {
    url: url_get_infor,
    form: param
};

app.post('/api/register', function (req, res) {
    let re_capcha = req.body['g-recaptcha-response'];
    // console.log(req);
    if (_.isEmpty(re_capcha)) {
        res.json({
            err: true,
            msg: 'Re-capcha is not valid!'
        });
        return;
    }

    let mssv = req.body.msv;
    let email = req.body.email;

    if (!validator.isEmail(email) || mssv.length != 8) {
        res.status(404).json({
            err: true,
            msg: 'Email or Mssv is invalid!'
        });
        return;
    }

    if (!checkParam.checkParamValidate(mssv) || !checkParam.checkParamValidate(email)) {
        res.status(404).json({
            err: true,
            msg: "Something went wrong!"
        });
        return;
    }

    mssv = checkParam.validateParam(mssv);
    email = checkParam.validateParam(email);

    form.form.keysearch = mssv;

    postWithMssv(mssv, email, req, res);
});

app.get('/api/active/:token', function (req, res) {
    let token = req.params.token;
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
    let url_parts = url.parse(req.url, true);
    let queries = url_parts.query;

    let mssv = queries.msv;
    if (_.isUndefined(mssv) || !checkParam.checkParamValidate(mssv)) {
        res.status(404).end();
        return;
    }

    if (mssv.length !== 8) {
        res.status(404).end();
        return;
    }

    let timetableArr = [];

    let student = {
        msv: mssv,
        name: '',
        qh: "lop",
        timetable: ''
    };

    form.form.keysearch = mssv;
    request.post(form, function (err, response, body) {
        if (err || response.statusCode != 200) {
            console.log(response);
            console.log(err);

            res.status(404).end("Something went wrong!");
            return;
        }

        // parser lop mon hoc
        let $ = cheerio.load(body, {
            decodeEntities: true
        });
        let trArr = $('tbody > tr');

        if (trArr.length <= 1) {
            res.status(404).end("Something went wrong!");
            return;
        }

        getNameLop(body, function (err, name, lop) {
            student.name = decoder.write(name);
            student.qh = lop;
            for (let i = 0; i < trArr.length; i++) {
                let trTemp = $(trArr[i]);
                let tdArr = trTemp.children('td');

                let chooseIdTd = $(tdArr[6]);
                let chooseNameTd = $(tdArr[7]);

                if (chooseIdTd.text().length != 0) {
                    let classId = chooseIdTd.text().toString().trim();
                    let className = chooseNameTd.text().toString().trim();
                    classId = classId.replace(" ", "");

                    let tempTimetable = {
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
    let re_capcha = req.body['g-recaptcha-response'];
    // if (_.isEmpty(re_capcha)) {
    //     res.json({
    //         err: true,
    //         msg: 'Re-capcha is not valid!'
    //     });
    //     return;
    // }

    let email = req.body.email;

    if (!checkParam.checkParamValidate(email)) {
        res.status(404).json({
            err: true,
            msg: "Something went wrong!"
        });
    }

    email = checkParam.validateParam(email);

    connection.query("SELECT * FROM user u WHERE u.email = ?", [email], function (err, results) {
        if (err) {
            res.json({
                err: true,
                msg: "Something went wrong!"
            });
        }

        // console.log(results);
        if (results.length == 0) {
            res.json({
                err: true,
                msg: "Email chưa đăng kí"
            });
        } else {
            let link = url_host + "/active/" + results[0].token;
            sendEmailActive(results[0].name, "fries.uet@gmail.com", results[0].email, link, function (err) {
                if (err) {
                    res.json({
                        err: true,
                        msg: "Something went wrong!"
                    });
                } else {
                    res.json({
                        err: false,
                        msg: "Thành công rồi đấy, check lại mail đi :D"
                    });
                }
            });
        }
    });
});

app.get('/api/results', function (req, res) {
    let subjectArr = [];
    connection.query('SELECT * FROM class WHERE ishasscore = true', function (err, results) {
        if (err) {
            res.end("Some thing went wrong!");
        } else {
            for (let i = 0; i < results.length; i++) {
                let idClass = results[i].idclass;
                let nameClass = results[i].name;
                let link = results[i].link;

                let subject = {
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
    connection.query("SELECT COUNT(*) AS countuser FROM user", function (err, results) {
        if (!err) {
            let countuser = results[0].countuser;
            connection.query("SELECT COUNT(*) AS countclass FROM class WHERE ishasscore = true", function (err, results) {
                if (!err) {
                    let countclass = results[0].countclass;
                    let count = {
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
            res.json({
                err: true,
                msg: "Something went wrong!"
            });
            return;
        }

        // parser lop mon hoc
        let $ = cheerio.load(body, {
            decodeEntities: true
        });
        let trArr = $('tbody > tr');

        if (trArr.length <= 1) {
            res.status(404).json({
                err: true,
                msg: "Không tồn tại mã số sinh viên"
            });
            return;
        }

        getName(body, function (err, name) {
            if (!err) {
                crypto.randomBytes(48, function (err, buffer) {
                    let token = buffer.toString('hex');
                    console.log(token);

                    let userSql = {
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
                            res.json({
                                err: true,
                                msg: "Email này đã có người đăng kí"
                            });
                        } else {
                            //Thanh cong
                            bot.newUser(userSql.mssv, userSql.email).end(function (res) {
                                console.log(res.body);
                            });

                            // response
                            let linkActive = url_host + "/active/" + token;
                            console.log('link: ' + linkActive);

                            sendEmailActive(name, "fries.uet@gmail.com", email, linkActive, function (err) {
                                if (err) {
                                    res.json({
                                        err: true,
                                        msg: "Something went wrong!"
                                    });
                                } else {
                                    res.json({
                                        err: false,
                                        msg: "Gửi email active thành công!"
                                    });

                                    for (let i = 0; i < trArr.length; i++) {
                                        let trTemp = $(trArr[i]);
                                        let tdArr = trTemp.children('td');

                                        let chooseTd = $(tdArr[6]);
                                        let chooseNameTd = $(tdArr[7]);

                                        if (chooseTd.text().length != 0) {
                                            let classId = chooseTd.text().toString().trim();
                                            classId = classId.replace(" ", "");
                                            classId = classId.toLowerCase();

                                            let className = chooseNameTd.text().toString().trim();
                                            if (classId.length > 0) {
                                                // console.log(classId);
                                                let classTemp = {
                                                    id: "",
                                                    idclass: classId,
                                                    name: className,
                                                    ishasscore: false
                                                };

                                                connection.query("INSERT INTO class SET ?", classTemp, function (err, result) {
                                                });

                                                let userClass = {
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

    let helper = require('sendgrid').mail;
    from_email = new helper.Email(from);
    to_email = new helper.Email(to);
    subject = "Xác nhận tài khoản";

    let content_html = "Xin chào " + name + "<br>" + "<br>" +
        "Chỉ còn 1 bước nữa là xong. Hãy click vào link dưới đây để hoàn tất." + "<br>" +
        "Link: " +
        "<a" + "href=" + linkActive + ">" + linkActive + "</a>" + "<br>" +
        "<strong>" + "Nếu không phải bạn hãy bỏ qua email này. " + "</strong>" +
        "Thân chào và quyết thắng!" + "<br>" +
        "Fries Team.";

    content = new helper.Content("text/html", content_html);
    mail = new helper.Mail(from_email, subject, to_email, content);

    let sg = require('sendgrid').SendGrid(process.env.SG_KEY);
    let requestBody = mail.toJSON();
    let request = sg.emptyRequest();
    request.method = 'POST';
    request.path = '/v3/mail/send';
    request.body = requestBody;
    sg.API(request, function (response) {
        // console.log(response.statusCode);
        // console.log(response.body);
        // console.log(response.headers);
        let err = true;
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

let connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("Connected to mysql!");


});

// get name
function getNameLop(body, callback) {
    let $ = cheerio.load(body, {
        decodeEntities: true
    });

    let trArr = $('tbody > tr');
    let trTemp = $(trArr);
    let tdArr = trTemp.children('td');
    let chooseTd = $(tdArr[2]);
    let chooseLopTd = $(tdArr[4]);
    if (chooseTd.text().length != 0) {
        let name = chooseTd.text().toString().trim();
        let lop = chooseLopTd.text().toString().trim();
        callback(false, name, lop);
    }
}

function getName(body, callback) {
    let $ = cheerio.load(body, {
        decodeEntities: true
    });

    let trArr = $('tbody > tr');
    let trTemp = $(trArr);
    let tdArr = trTemp.children('td');
    let chooseTd = $(tdArr[2]);
    if (chooseTd.text().length != 0) {
        let name = chooseTd.text().toString().trim();
        callback(false, name);
    }
}