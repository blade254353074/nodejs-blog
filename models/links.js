var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var linksSchema = new Schema({
    name: String,
    link: String,
    create_at: Date
}, {
    collection: 'links'
});
exports.Links = mongoose.model('Links', linksSchema);
