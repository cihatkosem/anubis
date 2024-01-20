const mongoose = require('mongoose');

module.exports = mongoose.model("bansStats", mongoose.Schema({
    id: String,
    bans: Array
}))