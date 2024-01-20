const mongoose = require('mongoose');

module.exports = mongoose.model("invitesStats", mongoose.Schema({
    id: String,
    invites: Array
}))