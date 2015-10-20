var express = require('express'),
    router = express.Router();

var _ = require('lodash'); // 对象操作库

var Category = require('../../models/category').Category;

// 分类列表 Read
router.get('/categories/posts/:page', function(req, res, next) {
    // 确保page是整数
    var page = Math.abs(req.params.page) || 1;
    // 每页的行数
    var row_num = 15;

    Category.count().exec(function(err, count) {
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
        Category.find()
            .skip(skipPage)
            .limit(row_num)
            .sort({
                create_at: -1
            })
            .exec(function(err, categories) {
                if (err) {
                    console.error(err);
                    return res.status(500).render('error', err);
                }
                res.render('./admin/category/list', {
                    title: '分类列表',
                    categories: categories,
                    total: total,
                    page: page
                });
            });
    });
});

// 添加分类界面
router.get('/categories', function(req, res, next) {
    res.render('./admin/category/add', {
        title: '分类添加'
    });
});

// 分类原始名查重
router.get('/categories/:name_raw/check', function(req, res, next) {
    var name_raw = req.params.name_raw.trim();
    if (!name_raw) {
        return res.status(500).json({
            state: false
        });
    }
    Category.findOne({
            name_raw: name_raw
        })
        .exec(function(err, category) {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    state: false
                });
            }
            res.json({
                repeat: !!category
            });
        });
});

// 添加分类 Create
router.post('/categories', function(req, res, next) {
    req.body['create_at'] = new Date();
    var category = new Category(req.body);
    console.log(category);
    category.save(function(err, category, numAffected) {
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

// 获取分类内容 Read
router.get('/categories/:id', function(req, res, next) {
    Category.findById(req.params.id)
        .exec(function(err, category) {
            if (err) {
                res.status(500).render('error', err);
                return console.error(err.message);
            }
            var weights = [];
            for (var i = 1; i < 10; i++) {
                var selected = false;
                if (category.weight === i) {
                    selected = true;
                }
                weights.push({
                    weight: i,
                    selected: selected
                });
            }
            res.render('./admin/category/edit', {
                title: '修改分类：「' + category.name + '」',
                category: category,
                weights: weights
            });
        });
});

// 修改分类 Update
router.put('/categories/:id', function(req, res, next) {
    var newCategory = req.body;

    Category.findOneAndUpdate({
        _id: req.params.id
    }, {
        $set: newCategory
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

// 删除分类 Delete
router.delete('/categories/:id', function(req, res, next) {
    var id = req.params.id;
    Category.remove({
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
