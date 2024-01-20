const mongoose = require('mongoose')

module.exports = mongoose.model("invites", mongoose.Schema({
    code: String,
    maxAge: Number,
    uses: Number,
    maxUses: Number,
    inviterId: String,
    guildId: String,
    channelId: String,
    createdTimestamp: String,
    usesUsers: Array,
    deleted: Boolean
}))