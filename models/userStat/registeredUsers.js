const mongoose = require('mongoose');

module.exports = mongoose.model("registeredUsersStats", mongoose.Schema({
    id: String,
    registeredUsers: Array
}))