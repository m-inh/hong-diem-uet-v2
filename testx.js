var express = require('express');
var url = require('url');

var app = express();

app.get('/aaa', function (req, res) {
    var url_parts = url.parse(req.url, true);
    console.log(url_parts.query);
});

app.listen(1234, function () {
    console.log('listening on 2345');
});