// 入口文件
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Article = require('../models/article').Article,
    Links = require('../models/links').Links;

var hbs = require('hbs');
var _global = {};

mongoose.connect('mongodb://localhost/express-test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.on('open', function(callback) {
    console.log('数据库连接成功');

    // 读取博客站点配置
    var Config = require('../models/config').Config;
    var meta_dynamic = '',
        meta_static = '';
    Config.find()
        .exec(function(err, config) {
            if (err) {
                _global.blog_title = '博客标题';
                meta_static += '<meta name="author" content="作者">' +
                    '<meta name="email" content="邮箱">';
                meta_dynamic += '<meta name="description" content="描述">' +
                    '<meta name="keywords" content="关键词">';
                return console.error(err.message);
            }
            var blog = config[0].blog;
            var profile = config[0].profile;

            _global.blog_title = blog.title;
            _global.list_count = blog.list_count;

            meta_static += '<meta name="author" content="' + profile.author + '">' +
                '<meta name="email" content="' + profile.email + '">';
            meta_dynamic += '<meta name="description" content="' + blog.description + '">' +
                '<meta name="keywords" content="' + blog.keywords + '">';

        });

    hbs.registerHelper('meta_static', function() {
        return meta_static;
    });

    hbs.registerHelper('meta_dynamic', function(meta) {
        if (meta) {
            return '<meta name="description" content="' + meta.description + '">' +
                '<meta name="keywords" content="' + meta.keywords + '">';
        }
        return meta_dynamic;
    });

});

router.get('/', function(req, res, next) {
    Article.find()
        .select({
            title: 1,
            update_date: 1
        })
        .limit(_global.list_count)
        .sort({
            update_date: -1
        })
        .exec(function(err, docs) {
            if (err) {
                console.error(err);
                return res.status(500).render('error', err);
            }
            Article.count().exec(function(err, count) {
                if (err) {
                    console.error(err);
                    return res.status(500).render('error', err);
                }
                res.render('index', {
                    title: _global.blog_title,
                    articles: docs,
                    total: Math.ceil(count / _global.list_count),
                    page: 1
                });
            });
        });

});

router.get('/links', function(req, res, next) {
    Links.find()
        .exec(function(err, links) {
            if (err) {
                console.error(err);
                return res.status(500).render('error', err);
            }
            res.render('links', {
                title: '友情链接',
                links: links
            });
        });
});

router.get('/about', function(req, res, next) {
    res.render('about', {
        title: '关于',
        content: '哦 哦 哦 哦哦哦'
    });
});


module.exports = router;
