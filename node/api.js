var mongoose = require("mongoose");
mongoose.Promise = Promise;
var uuid = require("node-uuid");
var formidable = require("formidable");
var fs = require("fs");
var sys = require("sys");
var multer = require('multer');
const path = require('path')
const moment = require('moment');
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
//最大投票数量
const vote_num = 3;
//表结构 全表查询
var Schema_student = new mongoose.Schema({
    name: { type: String },
    id: { type: String },
    phone: { type: String, maxlength: 11 },
    meg: { type: String, default: '' },
    img_path: { type: String },
    vote_num: { type: Number, default: 0, min: 0 }
});
var Schema_login = new mongoose.Schema({
    name: { type: String }, //<10位
    id: { type: String }, //8位长
    uid: { type: String },
    vote_date: { type: String, default: "2017-05-01" },
    vote_num: { type: Number, default: 0, min: 0, max: vote_num }
});
var Schema_stu = new mongoose.Schema({
    uid: Number,
    name: { type: String },
    // isVoted: Int32Array,
    role: { type: String },
});
// var Schema_vote = new mongoose.Schema({
//     name: String,
//     id: String,
//     vote_date: { type: String, default: "2017-05-01" },
//     vote_num: { type: Number, default: 0 }
// });
var model_Student = db.model('students', Schema_student);
var model_login = db.model('logins', Schema_login);
var model_stu = db.model("stus", Schema_stu);
// var model_vote = db.model("votes", Schema_vote);


// var data = { name: "李希萌", id: "15051720", phone: '18100170574', meg: '这是一些宣言！', img_path: '/hear/aaaa' };
// var Student = new model_Student(data);

var t1 = moment(new Date()).format('YYYY-MM-DD');
console.log(t1);
const time_submit_start = new Date("2017-05-10 00:00:00").getTime();
const time_submit_end = new Date("2017-05-13 00:00:00").getTime();
const time_vote_start = new Date("2017-05-13 00:00:00").getTime();
const time_vote_end = new Date("2017-05-18 00:00:00").getTime();


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
        // console.log(uuid.v4());
        var data = {};
        try {
            console.log(req.body.name + " " + req.body.id);
            data.name = req.body.name;
            data.uid = parseInt(req.body.id);
            // console.log(data.hasOwnProperty('uid'));
            // console.log(data.uid);
            if (isNaN(data.uid)) {
                throw '非法学号';
            }
        } catch (err) {
            console.log(err);
            res.json({
                flag: false,
                data: {
                    meg: '请核对学号和姓名'
                }
            });
            return;
        }

        var time_now = Date.now();
        //注册时间
        if (time_now < time_submit_start) {
            res.json({
                flag: false,
                data: {
                    meg: '还未开始报名'
                }
            });
        } else if (time_now < time_submit_end) {
            model_stu.findOne(data, function(err, result) {
                if (err) {
                    console.log(err);
                    res.json({
                        flag: false
                    });
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
                            res.json({
                                flag: false,
                                data: {
                                    meg: '请核对学号和姓名'
                                }
                            });
                            return;
                        } else if (result) {
                            var res_data = {
                                flag: true,
                                url: '/static/sign/' + result.uid
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
                                            var url = '/static/sign/' + data_l.uid;
                                            var res_data = {
                                                flag: true,
                                                url: url
                                            };
                                            res.json(res_data);
                                        }
                                    });
                                }
                            });
                        }
                    });
                } else {
                    res.json({
                        flag: false,
                        data: {
                            meg: '请核对学号和姓名'
                        }
                    });
                }
            });
        } else if (time_now < time_vote_start) { //注册结束 投票之前
            res.json({
                flag: false,
                data: {
                    meg: '报名已结束，投票尚未开始'
                }
            });
        } else if (time_now < time_vote_end) { //投票中
            model_stu.findOne(data, function(err, doc) {
                if (err) {
                    console.log(err);
                    res.json({
                        flag: false,
                        data: {
                            meg: '请核对学号和姓名'
                        }
                    });
                    // console.log("hear");
                    return;
                } else if (doc) {
                    var data_l = {
                        id: data.uid.toString(),
                        name: data.name
                    }
                    console.log(data_l);
                    model_login.findOne(data_l, function(err, doc) {
                        if (err) {
                            console.log(err);
                            res.json({ flag: false });
                            return;
                        } else if (doc) {
                            var res_data = {
                                flag: true,
                                url: '/static/show/' + doc.uid
                            }
                            res.json(res_data);
                        } else {
                            // 新用户登录
                            data_l.uid = uuid.v4();
                            var login = model_login(data_l);
                            login.save(function(err) {
                                if (err) {
                                    console.log(err);
                                    res.json({ flag: false });
                                } else {
                                    console.log('save success');
                                    var url = '/static/show/' + data_l.uid;
                                    var res_data = {
                                        flag: true,
                                        url: url
                                    };
                                    res.json(res_data);
                                }
                            });
                        }
                    });
                } else {
                    res.json({ flag: false });
                }
            });
        } else { //投票后
            model_stu.findOne(data, function(err, doc) {
                if (err) {
                    console.log(err);
                    res.json({
                        flag: false,
                        data: {
                            meg: '请核对学号和姓名'
                        }
                    });
                    // console.log("hear");
                    return;
                } else if (doc) {
                    var data_l = {
                        id: data.uid.toString(),
                        name: data.name
                    }
                    console.log(data_l);
                    model_login.findOne(data_l, function(err, doc) {
                        if (err) {
                            console.log(err);
                            res.json({ flag: false });
                            return;
                        } else if (doc) {
                            var res_data = {
                                flag: true,
                                url: '/static/show/' + doc.uid
                            }
                            res.json(res_data);
                        } else {
                            // 新用户登录
                            data_l.uid = uuid.v4();
                            var login = model_login(data_l);
                            login.save(function(err) {
                                if (err) {
                                    console.log(err);
                                    res.json({ flag: false });
                                } else {
                                    console.log('save success');
                                    var url = '/static/show/' + data_l.uid;
                                    var res_data = {
                                        flag: true,
                                        url: url
                                    };
                                    res.json(res_data);
                                }
                            });
                        }
                    });
                } else {
                    res.json({ flag: false });
                }
            });
            // res.json({
            //     flag: false,
            //     data: {
            //         meg: '投票以结束'
            //     }
            // });
        }
    });
    //取得注册信息
    //name为姓名
    //id为学号
    //uidw为标示
    route.post('/student/get', function(req, res) {
        var t1 = moment(new Date()).format('YYYY-MM-DD');
        console.log(t1);
        // console.log(uuid.v4());
        var data = {};
        try {
            console.log(req.body.uid);
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
                        return;
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
            console.log(data.uid);
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
                    return;
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
            var uid = req.params.name;
            var id = req.params.id;
            var data = {};
            data.uid = uid;
            console.log(req.file.filename + " " + uid);
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
    //信息展示
    //{uid}
    route.post('/student/get_all', function(req, res) {
        var data = {};
        try {
            console.log(req.body.uid);
            data.uid = req.body.uid;
        } catch (err) {
            console.log(err);
            res.json({ flag: false });
        }
        model_login.findOne(data, function(err, result) {
            if (err) {
                onsole.log(err);
                res.json({ flag: false });
                return;
            } else if (result) {
                model_Student.find({ "img_path": { $exists: true } }, '_id name meg img_path vote_num', function(err, resf) {
                    if (err) {
                        console.log(err);
                        res.json({ flag: false });
                        return;
                    } else {
                        var res_data = {
                            flag: true,
                            data: resf
                        }
                        console.log(res_data);
                        res.json(res_data);
                    }
                });
            } else {
                console.log("未注册的用户");
                res.json({ flag: false });
                return;
            }
        });
    });
    //投票端口 {uid,_id}
    route.post('/student/vote', function(req, res) {
        var time_now = Date.now();
        if (time_now < time_vote_start) {
            res.json({
                flag: false,
                data: {
                    meg: '投票尚未开始'
                }
            });
            return;
        }
        if (time_now > time_vote_end) {
            res.json({
                flag: false,
                data: {
                    meg: '投票时间已过'
                }
            });
            return;
        }

        var data = {};
        var _id = [];
        try {
            console.log(req.body);
            data.uid = req.body.uid;
            _id = req.body._id;
        } catch (err) {
            console.log(err);
            res.json({ flag: false });
            return;
        }
        if (_id == undefined) {
            res.json({
                flag: false,
                data: {
                    meg: '你没有选择'
                }
            });
            return;
        }
        if (_id.length != vote_num) {
            res.json({
                flag: false,
                data: {
                    meg: '您应投三张票'
                }
            });
            return;
        }
        if (_id[0] == _id[1] || _id[1] == _id[2] || _id[0] == _id[2]) {
            res.json({
                flag: false,
                data: {
                    meg: '不能投给同一个人^_^'
                }
            });
            return;
        }
        model_login.findOne(data, function(err, doc) {
            if (err) {
                console.log(err);
                res.json({ flag: false });
            } else if (doc) {
                //投票主逻辑
                var time_now = moment(new Date()).format('YYYY-MM-DD');
                var conditions = {
                    "uid": data.uid,
                    "$or": [
                        { "vote_num": { "$lt": vote_num } },
                        { "vote_time": { "$ne": time_now } }
                    ]
                };
                console.log(conditions);
                // model_login.update(cons);
                model_login.findOne(conditions, function(err, doc) {
                    if (err) {
                        console.log(err);
                    } else if (doc) {
                        console.log(doc);
                        //今日已投票
                        if (doc.vote_date == time_now) {
                            if (doc.vote_num + _id.length > vote_num) {
                                //多投了
                                res.json({
                                    flag: false,
                                    data: {
                                        meg: "您只能再投" + (vote_num - doc.vote_num) + "张"
                                    }
                                });
                            } else {
                                var updata = {
                                    "$inc": { "vote_num": _id.length },
                                    "$set": { "vote_date": time_now }
                                }
                                model_login.update(conditions, updata, function(err, num) {
                                    console.log('hear3', num);
                                    if (err) {
                                        console.log(err);
                                        res.json({ flag: flase });
                                        return;
                                    } else if (num.nModified == 1) {
                                        console.log("投票");
                                        model_Student.update({
                                            "_id": { "$in": _id }
                                        }, {
                                            "$inc": { "vote_num": 1 }
                                        }, {
                                            multi: true
                                        }, function(err, num) {
                                            console.log('hear4', num);
                                            if (err) {
                                                console.log(err);
                                                res.json({ flag: flase });
                                            } else if (num.nModified == _id.length) {
                                                res.json({ flag: true });
                                            } else {
                                                console.log(err);
                                                res.json({ flag: false });
                                            }
                                        });
                                    } else {
                                        res.json({ flag: false });
                                    }
                                })
                            }
                        } else {
                            //今日没投
                            var updata = {
                                "$set": { "vote_num": _id.length, "vote_date": time_now }
                            }
                            model_login.update(conditions, updata, function(err, num) {
                                console.log('hear1', num);
                                if (err) {
                                    console.log(err);
                                    res.json({ flag: flase });
                                } else if (num.nModified == 1) {
                                    res.json({ flag: true });
                                } else {
                                    console.log(err);
                                    res.json({ flag: false });
                                }
                                model_Student.update({
                                    "_id": { "$in": _id }
                                }, {
                                    "$inc": { "vote_num": 1 }
                                }, {
                                    multi: true
                                }, function(err, num) {
                                    console.log('hear2', num);
                                    if (err) {
                                        console.log(err);
                                        res.json({ flag: flase });
                                    } else if (num.nModified == _id.length) {
                                        res.json({ flag: true });
                                    } else {
                                        console.log(err);
                                        res.json({ flag: false });
                                    }
                                });
                            });
                        }
                    } else {
                        //今日已投票 并数量够
                        console.log("error");
                        res.json({
                            flag: false,
                            data: {
                                meg: "您今日已投过票"
                            }
                        })
                    }
                });
            } else {
                res.json({ flag: false });
            }
        });
    });
    //获取结果 {uid}
    route.post('/student/get_ans', function(req, res) {
        var data = {};
        try {
            console.log(req.body.uid);
            data.uid = req.body.uid;
        } catch (err) {
            console.log(err);
            res.json({ flag: false });
        }
        model_Student.find({}, '-_id name vote_num', { sort: [{ vote_num: -1 }] }, function(err, docs) {
            if (err) {
                console.log(err);
                res.json({ flag: false });
                return;
            } else {
                console.log(docs);
                res.json({
                    flag: true,
                    data: docs
                });
            }
        });
    });
    //取得是否需要投票
    route.post('/student/get_vote', function(req, res) {
        var uid;
        try {
            console.log(req.body.uid);
            uid = req.body.uid;
        } catch (err) {
            console.log(err);
            res.json({ flag: false });
        }
        var time_now = moment(new Date()).format("YYYY-MM-DD");
        var conditions = {
            "uid": uid,
            "vote_date": time_now,
            "vote_num": vote_num
        };
        console.log(conditions);
        model_login.count(conditions, function(err, count) {
            console.log(count);
            if (err) {
                console.log(err);
                res.json({ flag: flase });
            } else if (count == 1) {
                res.json({ flag: false });
            } else {
                res.json({ flag: true });
            }
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