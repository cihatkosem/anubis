const mongoose = require('mongoose');

module.exports = mongoose.model("rollbacks", mongoose.Schema({
    name: String,
    date: String, 
    authorId: String,
    excluded: Array
}))