const mongoose = require('mongoose');

module.exports = mongoose.model("voicesStats", mongoose.Schema({
    id: String,
    voices: Array
}))