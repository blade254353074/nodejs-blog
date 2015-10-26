var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    validate = require('mongoose-validator');

var userValidator = [
    validate({
        validator: 'isLength',
        arguments: [6, 18],
        message: '用户名应为{ARGS[0]}~{ARGS[1]}个字符'
    }),
    validate({
        validator: 'isAscii',
        message: '用户名'
    })
];

var adminSchema = new Schema({
    username: String,
    password: String
}, {
    collection: 'admin'
});

exports.Admin = mongoose.model('Admin', adminSchema);
