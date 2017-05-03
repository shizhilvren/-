// var server = require('./node/server.js');
// var router = require('./node/router');
// server.start(router.route);
var fs = require('fs');
var express = require("express");
var bodyParse = require("body-parser");
var mongoose = require("mongoose");
var route_api = require("./node/api.js");
var app = express();
var port = process.env.port || 8888;
var route_static = express.Router();
// var multer = require('multer');
// var upload = multer({ dest: 'uploads/' });
const path = require('path');

// var route_api = express.Router();




//app.use(multer({ dest: './uploads/' }));
app.use(bodyParse.json({ limit: '1mb' }));
app.use(bodyParse.urlencoded({
    extended: true
}));

// //主页
route_static.use(function(req, res, next) {
    console.log(req.method, req.url);
    next();
});
app.get('/static/sign.html/:uid', function(req, res) {
    // console.log('hear4');
    res.sendfile('./public/html/sign.html');
    //res.end();
});
app.get('/', function(req, res) {
    fs.readFile("index.html", function(err, data) {
        if (err) {
            console.log(err);
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.write("not find!");
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(data.toString());
        }
        res.end();
    });
});
app.use('/static', route_static);
app.use('/static', express.static('public'));
//var storage = multer.diskStorage({
//    destination: function (req, file, cb) {
//        cb(null, path.join(__dirname,'./public/img'))
//    },
//    filename: function (req, file, cb) {
//        cb(null, file.fieldname + '-' + Date.now())
//    }
//})
// app.use(multer({ dest: './public/img/',storage: storage}).array('image'));
app.use('/api', route_api.api());
app.listen(port);

// db.close();