const mongoose = require('mongoose');

module.exports = mongoose.model("tagStat", mongoose.Schema({
    executorId: String,
    userId: String,
    date: String,
}))