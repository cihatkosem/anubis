const mongoose = require('mongoose');

module.exports = mongoose.model("mutesStats", mongoose.Schema({
    id: String,
    mutes: Array
}))