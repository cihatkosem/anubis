const mongoose = require('mongoose')

module.exports = mongoose.model("roles", mongoose.Schema({
    id: String,
    icon: String,
    unicodeEmoji: String,
    name: String,
    color: String,
    hoist: Boolean,
    rawPosition: Number,
    permissions: Object,
    managed: Boolean,
    mentionable: Boolean,
    tags: Object,
    backup: {
        id: String,
        authorId: String,
        date: String,
        reason: String
    }
}))