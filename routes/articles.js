// 入口文件
var express = require('express'),
    router = express.Router();

var Article = require('../models/article').Article;

// 分页
router.get('/posts/:page', function(req, res, next) {
    // 当前页数 page
    var page = Math.abs(req.params.page) || 1;

    Article.count().exec(function(err, count) {
        if (err) {
            console.error(err);
            return res.status(500).render('error', err);
        }
        // 总页数 total
        var total = Math.ceil(count / 10),
            skipPage;
        // 超出范围
        if (page > total) {
            page = 1;
            skipPage = 0;
        } else {
            skipPage = (page - 1) * 10;
        }
        Article.find()
            .select({
                title: 1,
                update_date: 1
            })
            .skip(skipPage)
            .limit(10)
            .sort({
                update_date: -1
            })
            .exec(function(err, docs) {
                if (err) {
                    console.error(err);
                    return res.status(500).render('error', err);
                }
                res.render('./article/list', {
                    title: '文章列表',
                    articles: docs,
                    total: total,
                    page: page
                });
            });
    });

});

// 文章详情
router.get('/:id', function(req, res, next) {
    Article.findById(req.params.id)
        .populate({
            path: 'category',
            select: {
                _id: 0,
                name: 1,
                name_raw: 1
            }
        })
        .exec(function(err, doc) {
            if (err) {
                return console.log(err);
            }
            res.render('./article/detail', doc);
            if (doc.visit) {
                doc.visit++;
            } else {
                doc.visit = 1;
            }
            // 访问量 + 1
            doc.save(function(err, doc) {
                if (err) return console.error(err);
            });
        });
});

// 文章点赞
router.put('/:id/like', function(req, res, next) {
    var update;
    if (req.body.value === 'like') {
        update = {
            $inc: {
                like: 1
            }
        };
    } else if (req.body.value === 'dislike') {
        update = {
            $inc: {
                like: -1
            }
        };
    } else {
        // 参数错误
        res.status(400).json({
            error: "Invalid API key"
        });
        return;
    }
    // 更新数据库
    Article.update({
        _id: req.params.id
    }, update, function(err, raw) {
        if (err) {
            console.error(err);
            res.status(500).json({
                error: 'Internal Server Error'
            });
            return;
        }
        res.send();
    });
});


module.exports = router;
