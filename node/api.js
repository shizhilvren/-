var mongoose = require("mongoose");
mongoose.Promise = Promise;
var uuid = require("node-uuid");
var formidable = require("formidable");
var fs = require("fs");
var sys = require("sys");
var multer = require('multer');
const path = require('path')
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '../public/img'))
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '-' + req.params.id);
    }
})
var upload = multer({ storage: storage, limits: { fileSize: 1 * 1024 * 1024 } });

var db = mongoose.createConnection("localhost", "test");
db.on("error", console.error.bind(console, '连接错误'));
db.once('open', function() {
    console.log('连接成功');
});

//表结构 全表查询
var Schema_student = new mongoose.Schema({
    name: String,
    id: { type: String },
    phone: String,
    meg: String,
    img_path: String
});
var Schema_login = new mongoose.Schema({
    name: String, //<10位
    id: String, //8位长
    uid: String
});
var Schema_stu = new mongoose.Schema({
    uid: Number,
    name: String,
    // isVoted: Int32Array,
    role: String
});
var model_Student = db.model('students', Schema_student);
var model_login = db.model('logins', Schema_login);
var model_stu = db.model("stus", Schema_stu);


var data = { name: "李希萌", id: "15051720", phone: '18100170574', meg: '这是一些宣言！', img_path: '/hear/aaaa' };
var Student = new model_Student(data);

function api() {
    var express = require("express");
    var route = express.Router();
    route.use(function(req, res, next) {
        console.log(req.method, req.url);
        next();
    });
    //学生登录与注册
    //name为姓名
    //id为学号
    route.post('/student/login', function(req, res) {
        console.log(req.body.name + req.body.id);
        // console.log(uuid.v4());
        var data = {};
        try {
            data.name = req.body.name;
            data.uid = parseInt(req.body.id);
        } catch (err) {
            res.json({ flag: false });
            return;
        }
        model_stu.findOne(data, function(err, result) {
            if (err) {
                console.log(err);
                res.json({ flag: false });
                // console.log("hear");
                return;
            } else if (result) {
                var data_l = {
                    id: data.uid.toString(),
                    name: data.name
                }

                model_login.findOne(data_l, function(err, result) {
                    if (err) {
                        console.log(err);
                        res.json({ flag: false });
                        return;
                    } else if (result) {
                        var res_data = {
                            flag: true,
                            url: '/static/sign.html/' + result.uid
                        }
                        res.json(res_data);
                    } else {
                        data_l.uid = uuid.v4();
                        var login = model_login(data_l);
                        login.save(function(err) {
                            if (err) {
                                console.log(err);
                                res.json({ flag: false });
                            } else {
                                console.log('img save success');
                                var ins = {
                                    id: data_l.id,
                                    name: data_l.name
                                };
                                var student = model_Student(ins);
                                student.save(function(err) {
                                    if (err) {
                                        console.log(err);
                                        res.json({ flag: false });
                                    } else {
                                        var url = '/static/sign.html/' + data_l.uid;
                                        var res_data = {
                                            flag: true,
                                            url: url
                                        };
                                        res.json(res_data);
                                    }
                                });
                            }
                        })
                    }
                });
            } else {
                res.json({ flag: false });
            }
        });
    });
    //取得注册信息
    //name为姓名
    //id为学号
    //uidw为标示
    route.post('/student/get', function(req, res) {
        console.log(req.body.uid);
        // console.log(uuid.v4());
        var data = {};
        try {
            data.uid = req.body.uid;
        } catch (err) {
            console.log(err);
            res.json({ flag: false });
            return;
        }
        // console.log(data);
        model_login.findOne(data, function(err, result) {
            if (err) {
                console.log(err);
                res.json({ flag: false });
                return;
            } else if (result) {
                var sel = {};
                sel.name = result.name;
                sel.id = result.id;
                model_Student.findOne(sel, function(err, resf) {
                    if (err) {
                        console.log(err);
                        res.json({ flag: false });
                    } else {
                        var res_data = {};
                        //console.log(resf,'hearrrrrrr');
                        try {
                            res_data.data = {
                                name: resf.name,
                                id: resf.id,
                                phone: resf.phone,
                                meg: resf.meg,
                                img_path: resf.img_path
                            };
                            res_data.flag = true;
                            res.json(res_data);
                        } catch (err) {
                            console.log(err);
                            res.json({ flag: false });
                        }
                    }
                });
            } else {
                console.log("未注册的用户");
                res.json({ flag: false });
                return;
            }
        });
    });
    //修改信息
    route.post('/student/change', function(req, res) {
        console.log(req.body);
        //console.log(uuid.v4());
        var data = {};
        try {
            data.uid = req.body.uid;
        } catch (err) {
            res.json({ flag: false });
            return;
        }
        // console.log(data);
        model_login.findOne(data, function(err, result) {
            if (err) {
                console.log(err);
                res.json({ flag: false });
                return;
            } else {
                // console.log(result);
                var old_sel = {};
                try {
                    old_sel.name = result.name;
                    old_sel.id = result.id;
                    var new_sel = {
                        $set: {
                            // name: result.name,
                            // id: result.id,
                            phone: req.body.phone,
                            meg: req.body.meg
                                // img_path: req.body.img_path
                        }
                    };
                } catch (err) {
                    console.log('err insert');
                    res.json({ flag: false });
                }
                model_Student.update(old_sel, new_sel, function(err, resf) {
                    if (err) {
                        console.log('insert err');
                        res.json({ flag: false });
                    } else {
                        res.json({ flag: true });
                    }
                });
            }
        });
    });
    //图片上传
    route.post('/student/img/:name/:id', function(req, res) {

        var f = upload.single("file");

        f(req, res, function(err) {
            if (err) {
                res.json({
                    flag: false,
                    data: {
                        meg: '文件过大'
                    }
                })
                return;
            }
            console.log(req.file.filename);
            var uid = req.params.name;
            var id = req.params.id;
            var data = {};
            data.uid = uid;
            model_login.findOne(data, function(err, result) {
                if (err) {
                    console.log(err);
                    res.json({ flag: false });
                } else if (result) {
                    var old_sel = {
                        name: result.name,
                        id: result.id
                    };
                    var img_path = "/static/img/" + req.file.filename;
                    var new_sel = {
                        $set: {
                            img_path: img_path
                        }
                    };
                    model_Student.update(old_sel, new_sel, function(err, resf) {
                        if (err) {
                            console.log(err);
                            res.json({ flag: false });
                        } else {
                            var res_data = {};
                            // res_data.img_path = img_path;
                            res_data = {
                                    flag: true,
                                    data: {
                                        img_path: img_path
                                    }
                                }
                                // res.data = res_data;
                                // console.log(res_data);
                            res.json(res_data);
                        }
                    });
                } else {
                    console.log(err);
                    res.json({ flag: false });
                }
            });
            // console.log(req.file);
            // console.log(uid);
            // res.json({ flag: true });
            return;
        });

    });



    return route;
}


//判断是否为本校师生 data{id,name}
function is_in(data) {
    var sel = {};
    try {
        sel.id = data.id;
        sel.name = data.name;
    } catch (err) {
        return false;
    }
    var flag = ture;
    model_login.findOne(data, function(err, result) {
        if (err) {
            flag = false;
        } else if (result) {
            return true;
        } else {
            return false;
        }
    });
    return flag;
}

module.exports.api = api;