var express = require('express'),
    router = express.Router();

var _ = require('lodash'), // 对象操作库
    crypto = require('crypto'), // nodejs原生加密工具
    ccap = require('ccap'), // c++编写的验证码生成工具
    randomString = require('random-string');

var Admin = require('../models/admin/user').Admin,
    Article = require('../models/article').Article,
    Category = require('../models/category').Category;

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
    console.log(req.headers.referer);
    res.render('./admin/login', {
        title: '登录'
    });
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
    // console.log(req.headers);
    // todo
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
    Article.findById(req.params.id, function(err, article) {
        if (err) {
            // 未找到此id文章
            console.error(err.message);
            return res.json({
                state: false
            });
        }
        article.update({
                $set: req.body,
                $set: {
                    update_date: new Date()
                }
            })
            .exec(function(err, raw) {
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

module.exports = router;
