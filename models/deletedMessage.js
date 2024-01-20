const mongoose = require('mongoose')

module.exports = mongoose.model("deletedMessages", mongoose.Schema({
    id: String,
    channelId: String,
    authorId: String,
    executorId: String,
    content: String,
    date: String,
    deletedDate: String
}))