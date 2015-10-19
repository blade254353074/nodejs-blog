var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var articleSchema = new Schema({
    title: String,
    author: String,
    description: String,
    keywords: Array,
    category: [{
        type: Schema.Types.ObjectId,
        ref: 'Category'
    }],
    create_date: Date,
    update_date: Date,
    content_raw: String,
    content: String,
    like: {
        type: Number,
        default: 0
    },
    visit: {
        type: Number,
        default: 0
    }
}, {
    collection: 'article'
});

exports.Article = mongoose.model('Article', articleSchema);
