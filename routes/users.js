var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    User = require('../models/user').User;

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.redirect('/users/login');
});

router.get('/login', function(req, res, next) {
    res.render('./users/login', {
        title: '用户登录'
    });
});

router.post('/login', function(req, res, next) {
    var userData = {
        userid: req.body.userid,
        password: req.body.password
    };
    // Model.count
    // 返回符合条件的文档数。
    // Model.count(conditions, callback);
    User.count(userData, function(err, doc) {
        if (err) {
            console.log(err);
            return;
        }
        if (doc === 1) {
            req.session.userid = userData.userid;
            res.send({
                state: true
            });
        } else {
            res.send({
                state: false
            });
        }
    })
});

router.get('/home', function(req, res, next) {
    if (req.session.userid === undefined) {
        res.redirect('/users/login');
        return;
    }
    res.render('./users/home', {
        title: '个人主页',
        userid: req.session.userid
    });
});

module.exports = router;
