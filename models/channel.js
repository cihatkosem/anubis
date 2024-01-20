const mongoose = require('mongoose')

module.exports = mongoose.model("channels", mongoose.Schema({
    id: String,
    name: String,
    type: String,
    topic: String,
    nsfw: Boolean,
    parent: String,
    position: Number,
    bitrate: Number,
    userLimit: Number,
    rateLimitPerUser: Number,
    permissionOverwrites: Array,
    backup: {
        id: String,
        authorId: String,
        date: String,
        reason: String
    }
}))