var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var categorySchema = new Schema({
    name_raw: {
        type: String,
        trim: true,
        unique: true
    },
    name: String,
    weight: Number,
    create_at: Date,
    selected: Boolean
}, {
    collection: 'category'
});
exports.Category = mongoose.model('Category', categorySchema);
