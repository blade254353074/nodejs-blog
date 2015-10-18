var express = require('express'),
    router = express.Router(),
    crypto = require('crypto'),
    ccap = require('ccap'),
    randomString = require('random-string');

var Admin = require('../models/admin/user').Admin;

// 获取验证码
router.get('/captcha', function(req, res, next) {
    var captcha = ccap({
        width: 130,
        height: 50,
        offset: 30,
        quality: 100,
        fontsize: 40,
        generate: function() {
            var str = randomString({
                length: 4
            });
            return str;
        }
    });
    var cptArr = captcha.get();
    // 将生成的验证码存到session中
    req.session.captcha = cptArr[0].toLocaleLowerCase();
    res.write(cptArr[1]);
    res.end();
});

// 登录界面
router.get('/login', function(req, res, next) {
    res.render('./admin/login');
});

router.post('/login', function(req, res, next) {
    var captcha = req.body.captcha,
        username = req.headers.username,
        password = req.headers.password;

    if (!captcha || captcha.toLocaleLowerCase() !== req.session.captcha) {
        return res.json({
            state: false,
            captcha: false
        });
    }
    if (!username || !password) {
        return res.json({
            state: false
        });
    }
    Admin.findOne({
        username: username
    }, function(err, user) {
        var shasum;
        // 有此用户
        if (user) {
            // 用crypto sha1加密比较密码
            shasum = crypto.createHash('sha1');
            shasum.update(password);
            if (shasum.digest('hex') === user.password) {
                // 验证通过，添加_id到session
                req.session.user_id = user._id
                return res.json({
                    state: true
                });
            }
        }
        // 用户名或密码错误
        res.json({
            state: false
        });
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
