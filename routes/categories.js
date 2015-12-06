var express = require('express');
var router = express.Router();
var Category = require('../models/category')
  .Category;
var Article = require('../models/article')
  .Article;

// 所有分类
router.get('/', function(req, res, next) {
  Category.find()
    .select({
      name_raw: 1,
      name: 1,
    })
    .sort({
      weight: -1,
    })
    .exec(function(err, docs) {
      if (err) {
        console.error(err);
        return res.status(500)
          .render('error', err);
      }

      res.render('./category/list', {
        title: '文章分类',
        categories: docs,
      });
    });
});

// 分类详情
router.get('/:cate', function(req, res, next) {

  console.log('分类: ' + req.params.cate);

  Category.findOne({
      name_raw: req.params.cate,
    })
    .select({
      _id: 1,
      name: 1,
    })
    .exec(function(err, cate) {
      if (err) {
        console.error(err);
        return res.status(500)
          .render('error', err);
      }

      // 查询匹配为空
      if (!cate) {
        return res.render('./category/detail', {
          title: req.params.cate,
          articles: null,
        });
      }

      // 查询有效
      var id = cate._id;
      var cateName = cate.name;
      Article.find()
        .where('category')
        .in([id])
        .select({
          title: 1,
          update_date: 1,
        })
        .sort({
          update_date: -1,
        })
        .exec(function(err, articles) {
          if (err) {
            console.error(err);
            return res.status(500)
              .render('error', err);
          }

          res.render('./category/detail', {
            title: cateName,
            articles: articles,
          });
        });
    });
});

module.exports = router;
