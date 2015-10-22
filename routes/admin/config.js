var express = require('express'),
    router = express.Router();

var Config = require('../../models/config').Config;

// 个人资料 Read
router.get('/profile', function(req, res, next) {
    Config.findOne()
        .exec(function(err, config) {
            if (err) return res.render('error', err);
            if (!config) return next(new Error('not found'));
            res.render('./admin/config/profile', {
                title: '个人资料',
                config: config
            });
        });
});

// 个人资料 Read
router.put('/profile', function(req, res, next) {
    // var id = req.body._id;
    // delete req.body._id;

    Config.findOneAndUpdate({}, {
            $set: req.body
        })
        .exec(function(err, result) {
            console.log(result);
            if (err) return res.json({
                state: false
            });
            res.json({
                state: true
            });
        });
});

// 博客配置 Read
router.get('/blog', function(req, res, next) {
    Config.findOne(function(err, config) {
        console.log(config);
        res.render('./admin/config/blog', {
            title: '博客配置'
        });
    });
});

module.exports = router;
