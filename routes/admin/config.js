var express = require('express'),
    router = express.Router();

var multiparty = require('multiparty'),
    path = require('path'),
    fs = require('fs');

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

// 个人资料 Update
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

// 个人头像 Update
router.post('/avatar', function(req, res, next) {
    // 需要multiparty组件
    var form = new multiparty.Form({
        uploadDir: './public/uploads/'
    });

    form.on('progress', function(bytesReceived, bytesExpected) {
        Math.floor(bytesReceived / bytesExpected * 100) / 100;
    });

    form.on('error', function(err) {
        console.log('Error parsing form: ' + err.stack);
    });

    form.parse(req, function(err, fields, files) {
        if (err) return res.render('error', err);
        /* 多文件上传， 未完成*/
        /*var length = files.upload.length;
        for (var i = 0, len = files.upload.length; i < len; i++) {
            var fileName = files.upload[i].originalFilename,
                filePath = files.upload[i].path;
            var newName = new Date().getTime() + '_' + fileName.slice(0, 12) + fileName.substring(fileName.lastIndexOf('.')),
                newPath = __dirname + '/public/uploads' + newName;
            fs.rename(filePath, newPath, function(err) {
                if (err) {
                    console.error('rename error: ' + err);
                    return res.json({
                        state: false
                    });
                }
                res.json({
                    state: true,
                    url: newPath
                });
            });
        }*/

        /* 单文件上传*/
        var fileName = files.upload[0].originalFilename,
            filePath = files.upload[0].path,
            fileSize = files.upload[0].size;
        if (fileSize > 5 * 1000 * 1000) {
            // 大于5MB
            return res.json({
                state: false
            });
        }
        var newName = new Date().getTime() + '_' + fileName.substring(0, fileName.lastIndexOf('.')).slice(0, 12) + fileName.substring(fileName.lastIndexOf('.')),
            newPath = './public/uploads/' + newName;
        fs.rename(filePath, newPath, function(err) {
            if (err) {
                console.error('rename error: ' + err);
                return res.json({
                    state: false
                });
            }
            res.json({
                state: true,
                url: newPath
            });
        });
    });
});

// 博客配置 Read
router.get('/blog', function(req, res, next) {
    Config.findOne()
        .exec(function(err, config) {
            if (err) return res.render('error', err);
            if (!config) return next(new Error('not found'));
            res.render('./admin/config/blog', {
                title: '博客配置',
                config: config
            });
        });
});

// 博客配置 Update
router.put('/blog', function(req, res, next) {
    Config.findOneAndUpdate({}, {
            $set: req.body
        })
        .exec(function(err, result) {
            if (err) return res.json({
                state: false
            });
            res.json({
                state: true
            });
        });
});

module.exports = router;
