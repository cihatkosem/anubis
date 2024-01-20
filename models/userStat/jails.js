const mongoose = require('mongoose');

module.exports = mongoose.model("jailsStats", mongoose.Schema({
    id: String,
    jails: Array
}))