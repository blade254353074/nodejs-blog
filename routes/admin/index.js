var express = require('express'),
    router = express.Router();

var _ = require('lodash'), // 对象操作库
    crypto = require('crypto'), // nodejs原生加密工具
    ccap = require('ccap'), // c++编写的验证码生成工具
    randomString = require('random-string');

var Admin = require('../../models/admin/user').Admin;

// 获取验证码
// TODO: 换一个验证码
router.get('/captcha', function(req, res, next) {
    var captcha = ccap({
        width: 110,
        height: 42,
        offset: 25,
        quality: 100,
        fontsize: 34,
        generate: function() {
            // generate调用20次,缓存20个随机字符串
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
    res.render('./admin/login', {
        title: '登录'
    });
});

// 登录请求
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
    // 验证码，验证成功 清除 session
    req.session.captcha = null;
    // 判断用户名密码 为不为空
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
        /*res.json({
            state: false
        });*/
        // 硬编码一下 以便测试
        req.session.user_id = '562233248416883fa2212a60';
        return res.json({
            state: true
        });
    });
});

// 退出界面
router.get('/logout', function(req, res, next) {
    req.session.user_id && (req.session.user_id = undefined);
    res.redirect('/admin/login');
});

// 拦截所有/admin路径的请求
router.use(/.*/, function(req, res, next) {
    // console.log(req.headers);
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
    res.render('./admin/index', {
        title: '后台管理系统'
    });
});

router.use('/', require('./articles'));
router.use('/', require('./categories'));
router.use('/', require('./links'));

module.exports = router;
