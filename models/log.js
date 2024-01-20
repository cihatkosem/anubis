const mongoose = require('mongoose');

module.exports = mongoose.model("logs", mongoose.Schema({
    name: String,
    channelId: String, 
    date: String, 
    authorId: String
}))