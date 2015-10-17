var express = require('express'),
    router = express.Router(),
    md5 = require('md5')
var authorize = require('../utils/filter').authorize;
var Admin = require('../models/admin/user').Admin;

// 登录界面
router.get('/login', function(req, res, next) {
    res.render('./admin/login');
});

router.post('/login', function(req, res, next) {
    Admin.findOne({
        username: req.headers.username,
        password: md5(req.headers.password)
    }, function(err, user) {
        if (user) {
            req.session.user_id = user._id
            res.json({
                state: true
            });
        } else {
            res.json({
                state: false
            })
        }
    });
});

// 退出界面
router.get('/logout', function(req, res, next) {
    res.redirect('/admin/login');
});

// 管理界面
router.get('/:action', authorize, function(req, res, next) {
    if ()
    res.render('./admin/index');
});

module.exports = router;
