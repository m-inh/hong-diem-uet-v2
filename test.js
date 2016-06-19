var mysql = require('mysql');
var checkParam = require('./check-param');
// var express = require('express');
// var app = express();

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'score_uet'
});

connection.connect(function (err) {
    if (!err) {
        // app.listen(3000, function () {
        //     console.log("listening on 3000");
        //
        // });

        var email = "TienMinh.uet@gmail   @£$%";

        if (checkParam.checkParamValidate(email)) {
            email = checkParam.validateParam(email);
            console.log(email + "    ok");
            var query = connection.query("SELECT * FROM user WHERE email = ?", [email], function (err, results) {
                console.log(results);
            });

            console.log(query.sql);
        }

    }
});


