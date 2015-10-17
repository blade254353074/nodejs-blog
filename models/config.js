var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var configSchema = new Schema({
    blog: {
        title: String,
        description: String,
        keywords: String,
        list_count: Number,
        copyright: String
    },
    profile: {
        author: String,
        company: String,
        location: String,
        email: String,
        avatar: String
    }
}, {
    collection: 'config'
});
exports.Config = mongoose.model('Config', configSchema);
