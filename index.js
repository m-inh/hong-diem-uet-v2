/**
 * Created by TooNies1810 on 6/16/16.
 */
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var cheerio = require('cheerio');

var app = express();
app.use(bodyParser());
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/public');
});


var url_get_infor = "http://203.113.130.218:50223/congdaotao/module/dsthi_new/index.php";

var param = {
    keysearch: ""
};

var form = {
    url: url_get_infor,
    form: param
};

app.get('/register', function (req, res) {
    console.log(req.body);
    // var mssv = req.body.mssv;
    var mssv = 13020285;
    form.form.keysearch = mssv;

    //
    request.post(form, function (err, response, body) {
        res.end(body);

        // parser lop mon hoc
        var $ = cheerio.load(body);
        var trArr = $('tbody > tr').next();

        console.log(trArr);

        // for (var i=1; i<tdArr.length; i++){
        //     // console.log( cheerio.load(trArr[i])('td').text());
        //     console.log(tdArr[i].find('td'));
        // }
    });
});

function postWithMssv(mssv) {
    form.form.keysearch = mssv;

    //
    request.post(form, function (err, response, body) {

        // parser lop mon hoc
        var $ = cheerio.load(body, {
            decodeEntities: true
        });
        var trArr = $('tbody > tr');

        for (var i = 0; i < trArr.length; i++) {
            var trTemp = $(trArr[i]);
            var tdArr = trTemp.children('td');

            var chooseTd = $(tdArr[6]);

            if (chooseTd.text().length != 0) {
                var classId = chooseTd.text().trim();
                if (classId.length > 0) {
                    console.log(classId);
                }
            }
        }
    });
}


// app.listen(2345, function () {
//     console.log("listening on 2345");
// });

// test 
postWithMssv('13020285');