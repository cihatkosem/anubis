const mongoose = require('mongoose')

module.exports = mongoose.model("commands", mongoose.Schema({
    id: String,
    names: Array,
    description: String,
    authorities: Array,
    available: Boolean,
    permission: String,
    subAuthorites: Array,
    channels: Array,
}))