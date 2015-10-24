var express = require('express'),
    router = express.Router();

// 文件上传，及图片处理工具
var multiparty = require('multiparty'),
    path = require('path'),
    imageinfo = require('imageinfo'),
    gm = require('gm'),
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
        maxFilesSize: 5 * 1000 * 1000,
        uploadDir: './public/uploads/'
    });

    form.on('progress', function(bytesReceived, bytesExpected) {
        Math.floor(bytesReceived / bytesExpected * 100) / 100;
    });

    form.on('error', function(err) {
        console.log('Error parsing form: ' + err.stack);
    });

    form.parse(req, function(err, fields, files) {
        if (err) {
            console.error(err);
            return res.json({
                state: false
            });
        }
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
        if (!files.upload) {
            // 没有文件
            return res.json({
                state: false
            });
        }
        /* 单文件上传*/
        var image = files.upload[0];
        var fileName = image.originalFilename,
            filePath = image.path, // 临时文件路径
            fileSize = image.size;

        // 获取上传文件的buffer, 利用imageinfo模块读取buffer中的mimeType
        var result = fs.readFileSync(filePath),
            info = imageinfo(result);

        // 判断文件大小和类型
        if (fileSize > 5000000 || !info || info.type !== 'image') {
            // 大于5MB或者 不是image类型
            // 删除临时文件
            fs.unlink(filePath, function(err) {
                if (err) console.error(err);
            });
            return res.json({
                state: false
            });
        }
        console.log(info);
        console.log("Data is type:", info.mimeType);
        console.log("Dimensions:", info.width, "x", info.height);
        // 新文件名由 时间戳_文件名前12位.jpg 组成
        var newName = new Date().getTime() + '_' + fileName.substring(0, fileName.lastIndexOf('.')).slice(0, 12) + '.' + info.format.toLocaleLowerCase();
        // 绝对和相对路径
        var absolutePath = '/uploads/' + newName,
            relativePath = './public/uploads/' + newName;
        // 文件重命名
        /*fs.rename(filePath, relativePath, function(err) {
            if (err) {
                // 重命名出错，删除临时文件
                console.error('rename error: ' + err);
                fs.unlink(filePath, function(err) {
                    if (err) console.error(err);
                });
                return res.json({
                    state: false
                });
            }
        });*/
        var length = 200;
        var xLength, yLength;
        if (info.width <= info.height) {
            xLength = length; // 竖长
        } else {
            yLength = length; // 横长
        }
        gm(filePath)
            .resize(xLength, yLength)
            .stream(function(err, buffer, stderr) {
                var point = {
                    x: 0,
                    y: 0
                };
                if (xLength) {
                    point.y = length / info.width * info.height / 2 - length / 2; // 竖长
                }
                if (yLength) {
                    point.x = length / info.height * info.width / 2 - length / 2; // 横长
                }
                console.log(length, length, point.x, point.y);
                gm(buffer)
                    .crop(length, length, point.x, point.y)
                    .write(relativePath, function(err) {
                        fs.unlink(filePath, function(err) {
                            if (err) console.error(err);
                        });
                        if (err) {
                            console.error(err);
                            return res.json({
                                state: false
                            });
                        }
                        res.json({
                            state: true,
                            url: absolutePath
                        });
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
        }, {
            runValidators: true
        })
        .exec(function(err, result) {
            if (err) {
                var message = {};
                for (var key in err.errors) {
                    console.log(err.errors[key].message);
                    message[key] = {
                        message: err.errors[key].message,
                        path: err.errors[key].path
                    };
                }
                console.error(err);
                return res.json({
                    state: false,
                    message: message
                });
            }
            res.json({
                state: true
            });
        });
});

module.exports = router;
