var express = require('express'),
    router = express.Router();

var _ = require('lodash'); // 对象操作库

var Article = require('../../models/article').Article,
    Category = require('../../models/category').Category;

// 文章列表 Read
router.get('/articles/posts/:page', function(req, res, next) {
    // 确保page是整数
    var page = Math.abs(req.params.page) || 1;
    // 每页的行数
    var row_num = 15;

    Article.count().exec(function(err, count) {
        if (err) {
            console.error(err);
            return res.status(500).render('error', err);
        }
        // 总页数 total
        var total = Math.ceil(count / row_num),
            skipPage;
        // 超出范围
        if (page > total) {
            page = 1;
            skipPage = 0;
        } else {
            skipPage = (page - 1) * row_num;
        }
        Article.find()
            // .select({
            //     title: 1,
            //     update_date: 1
            // })
            .skip(skipPage)
            .limit(row_num)
            .populate({
                path: 'category',
                select: {
                    name: 1,
                    name_raw: 1
                }
            })
            .sort({
                update_date: -1
            })
            .exec(function(err, articles) {
                if (err) {
                    console.error(err);
                    return res.status(500).render('error', err);
                }
                res.render('./admin/article/list', {
                    title: '文章列表',
                    articles: articles,
                    total: total,
                    page: page
                });
            });
    });
});

// 添加文章界面
router.get('/articles', function(req, res, next) {
    Category.find()
        .select({
            name: 1
        })
        .sort({
            weight: -1
        })
        .exec(function(err, categories) {
            if (err) {
                console.error(err);
                return res.status(500).render('error', err);
            }
            res.render('./admin/article/add', {
                title: '文章添加',
                categories: categories,
            });
        });
});

// 添加文章 Create
router.post('/articles', function(req, res, next) {
    var markdown = require("markdown").markdown;
    var article = new Article(req.body);

    article['create_date'] = article['update_date'] = new Date();
    try {
        article['content'] = markdown.toHTML(article.content_raw);
    } catch (err) {
        console.error(article + '\n' + err);
        return res.json({
            state: false
        });
    }
    // http://mongoosejs.com/docs/api.html#document_Document-update
    // this save action will auto add __v key to document
    article.save(function(err, article, numAffected) {
        if (err) {
            console.error(err);
            return res.json({
                state: false
            });
        }
        res.json({
            state: true
        });
    });
});

// 获取文章内容 Read
router.get('/articles/:id', function(req, res, next) {
    Article.findById(req.params.id)
        .populate({
            path: 'category',
            select: {
                name: 1
            }
        })
        .exec(function(err, article) {
            if (err) {
                res.status(500).render('error', err);
                return console.error(err.message);
            }
            Category.find()
                .select({
                    name: 1
                })
                .exec(function(err, categories) {
                    if (err) {
                        res.status(500).render('error', err);
                        return console.error(err.message);
                    }
                    // 遍历article.category
                    // 修改每个分类至选中
                    var mergedCate = [];
                    categories.forEach(function(category, index) {
                        var isSame = false;
                        _.forEach(article.category, function(selectedItem, index) {
                            selectedItem.selected = true;
                            if (category._id.equals(selectedItem._id)) {
                                isSame = true;
                                return mergedCate.push(selectedItem);
                            }
                        });
                        if (!isSame) {
                            mergedCate.push(category);
                        } else {
                            isSame = false;
                        }
                    });
                    article.category = mergedCate;
                    // 更新category成功
                    res.render('./admin/article/edit', {
                        title: '修改文章：「' + article.title + '」',
                        article: article,
                        meta: {
                            description: article.description,
                            keywords: article.keywords
                        }
                    });
                });
        });
});

// 修改文章 Update
router.put('/articles/:id', function(req, res, next) {
    var markdown = require("markdown").markdown;
    var newArticle = req.body;

    newArticle.update_date = new Date();
    try {
        newArticle['content'] = markdown.toHTML(newArticle.content_raw);
    } catch (err) {
        console.error(newArticle + '\n' + err);
        return res.json({
            state: false
        });
    }
    // 更新数据修改成功
    Article.findOneAndUpdate({
        _id: req.params.id
    }, {
        $set: newArticle
    }, {
        upsert: true
    }, function(err, raw) {
        if (err) {
            console.error(err.message);
            return res.json({
                state: false
            });
        }
        // 更新成功
        res.json({
            state: true
        });
    });
});

// 删除文章 Delete
router.delete('/articles/:id', function(req, res, next) {
    var id = req.params.id;
    Article.remove({
        _id: id
    }, function(err) {
        if (err) {
            console.error(err.message);
            return res.json({
                state: false
            });
        }
        // 删除成功
        res.json({
            state: true
        });
    });
});

// articles();
module.exports = router;
