const mongoose = require('mongoose')

module.exports = mongoose.model("register", mongoose.Schema({
    guildId: String,
    tag: String,
    unRegisterRoleId: String,
    registeredRoleId: String
}))