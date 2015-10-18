var express = require('express'),
    router = express.Router(),
    bcrypt = require('bcrypt');

var Admin = require('../models/admin/user').Admin;

// 登录界面
router.get('/login', function(req, res, next) {
    res.render('./admin/login');
});

router.post('/login', function(req, res, next) {
    Admin.findOne({
        username: req.headers.username
    }, function(err, user) {
        // 用bcrypt比较密码
        if (bcrypt.compareSync(req.headers.password, user.password)) {
            req.session.user_id = user._id
            res.json({
                state: true
            });
        } else {
            res.json({
                state: false
            });
        }
    });
});

// 退出界面
router.get('/logout', function(req, res, next) {
    req.session.user_id && (req.session.user_id = undefined);
    res.redirect('/admin/login');
});

// 拦截所有/admin路径的请求
router.get(/.*/, function(req, res, next) {
    if (!req.session.user_id) {
        if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
            // 如果是 ajax 请求 则返回401
            res.status(401).send();
        } else {
            // 普通整页请求直接重定向
            res.redirect('/admin/login');
        }
    } else {
        next();
    }
});

// 管理界面
router.get('/', function(req, res, next) {
    res.render('./admin/index');
});

module.exports = router;
