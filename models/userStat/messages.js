const mongoose = require('mongoose');

module.exports = mongoose.model("messagesStats", mongoose.Schema({
    id: String,
    messages: Array
}))