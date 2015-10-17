var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var adminSchema = new Schema({
    username: String,
    password: String
}, {
    collection: 'admin'
});

exports.Admin = mongoose.model('Admin', adminSchema);
