var express = require('express'),
    router = express.Router();

var _ = require('lodash'); // 对象操作库

var Links = require('../../models/links').Links;

// 友链列表 Read
router.get('/links/posts/:page', function(req, res, next) {
    // 确保page是整数
    var page = Math.abs(req.params.page) || 1;
    // 每页的行数
    var row_num = 15;

    Links.count().exec(function(err, count) {
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
        Links.find()
            .skip(skipPage)
            .limit(row_num)
            .sort({
                create_at: -1
            })
            .exec(function(err, links) {
                if (err) {
                    console.error(err);
                    return res.status(500).render('error', err);
                }
                res.render('./admin/links/list', {
                    title: '友链列表',
                    links: links,
                    total: total,
                    page: page
                });
            });
    });
});

// 添加友链界面
router.get('/links', function(req, res, next) {
    res.render('./admin/links/add', {
        title: '友链添加'
    });
});

// 添加友链 Create
router.post('/links', function(req, res, next) {
    var strRegex = "^((https|http|ftp|rtsp|mms)://)" + "(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" //ftp的user@
        + "(([0-9]{1,3}\.){3}[0-9]{1,3}" // IP形式的URL- 199.194.52.184
        + "|" // 允许IP和DOMAIN（域名）
        + "([0-9a-z_!~*'()-]+\.)*" // 域名- www.
        + "([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\." // 二级域名
        + "[a-z]{2,6})" // first level domain- .com or .museum
        + "(:[0-9]{1,4})?" // 端口- :80
        + "((/?)|" // a slash isn't required if there is no file name
        + "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$";
    var re = new RegExp(strRegex);
    // 判断link是否为正确url
    if (!re.test(req.body.link)) {
        return res.json({
            state: false
        });
    }
    req.body.create_at = new Date();
    var links = new Links(req.body);

    links.save(function(err, links, numAffected) {
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

// 获取友链内容 Read
router.get('/links/:id', function(req, res, next) {
    Links.findById(req.params.id)
        .exec(function(err, links) {
            if (err) {
                res.status(500).render('error', err);
                return console.error(err.message);
            }
            if (links) {
                res.render('./admin/links/edit', {
                    title: '修改友链：' + '「' + links.name + '」',
                    links: links
                });
            } else {
                next();
            }
        });
});

// 修改友链 Update
router.put('/links/:id', function(req, res, next) {
    var newLinks = req.body;
    var strRegex = "^((https|http|ftp|rtsp|mms)://)" + "(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" //ftp的user@
        + "(([0-9]{1,3}\.){3}[0-9]{1,3}" // IP形式的URL- 199.194.52.184
        + "|" // 允许IP和DOMAIN（域名）
        + "([0-9a-z_!~*'()-]+\.)*" // 域名- www.
        + "([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\." // 二级域名
        + "[a-z]{2,6})" // first level domain- .com or .museum
        + "(:[0-9]{1,4})?" // 端口- :80
        + "((/?)|" // a slash isn't required if there is no file name
        + "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$";
    var re = new RegExp(strRegex);
    // 判断link是否为正确url
    if (!re.test(newLinks.link)) {
        return res.json({
            state: false
        });
    }
    // 更新数据修改成功
    Links.findOneAndUpdate({
        _id: req.params.id
    }, {
        $set: newLinks
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

// 删除友链 Delete
router.delete('/links/:id', function(req, res, next) {
    var id = req.params.id;
    Links.remove({
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

// links();
module.exports = router;
