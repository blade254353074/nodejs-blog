// 入口文件
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Article = require('../models/article').Article,
    Links = require('../models/links').Links;

mongoose.connect('mongodb://localhost/express-test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.on('open', function(callback) {
    console.log('yay!\n');
});

router.get('/', function(req, res, next) {
    Article.find()
        .select({
            title: 1,
            update_date: 1
        })
        .limit(10)
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
                    title: 'SebastianBlde\'s Blog',
                    articles: docs,
                    total: Math.ceil(count / 10),
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
