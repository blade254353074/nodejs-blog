var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    validate = require('mongoose-validator');

var nameValidator = [
    validate({
        validator: 'isLength',
        arguments: [3, 20],
        message: '博客标题应为{ARGS[0]}~{ARGS[1]}个字符'
    })
];

var configSchema = new Schema({
    blog_title: {
        type: String,
        required: true,
        validate: nameValidator
    },
    blog_description: String,
    blog_keywords: String,
    blog_list_count: Number,
    blog_copyright: String,
    profile_author: String,
    profile_company: String,
    profile_location: String,
    profile_email: String,
    profile_avatar: String
}, {
    collection: 'config'
});
exports.Config = mongoose.model('Config', configSchema);
