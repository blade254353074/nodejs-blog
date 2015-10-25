# Start

1. npm install
2. I am using gm module，must install either GraphicsMagick or ImageMagick <a href="https://www.npmjs.com/package/gm" title="gm" target="_blank">npm gm</a>
3. mongorestore -d express-test ./backup/express-test // 还原express-test数据库
4. npm start
5. open [http://localhost:3000/](http://localhost:3000/)

# Feature

* Express (MVC framework -> <a href="http://www.expressjs.com.cn/4x/api.html" title="Express API" target="_blank">Express API</a>)
* MongoDB (NoSQL -> <a href="https://docs.mongodb.org/manual/" title="MongoDB API">MongoDB API</a>)
* RESTful API (API Standard -> <a href="http://www.ruanyifeng.com/blog/2014/05/restful_api.html" title="RESTful API设计指南">RESTful API设计指南</a>)
* Handlebars (Server HTML Template)
* Mongoose (ORM -> <a href="http://mongoosejs.com/docs/api.html" title="Mongoose API" target="_blank">Mongoose API</a>)
* Mongoose Validator (ORM Validator -> <a href="https://www.npmjs.com/package/mongoose-validator" title="mongoose-validator" target="_blank">npm mongoose-validator</a>)
* ccap captcha
* gm picture resize and crop

# TODO

* 项目构建转换为 -> [node-express-mongoose-demo](https://github.com/madhums/node-express-mongoose-demo/)
* 搞清楚app.locals, global使用方法
* 前端用gulp构建，将compass转换为gulp-sass
* 界面设计
* 相似/热门的文章
