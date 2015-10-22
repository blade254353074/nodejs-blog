var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var configSchema = new Schema({
    blog_title: String,
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
