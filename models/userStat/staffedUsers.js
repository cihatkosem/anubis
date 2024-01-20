const mongoose = require('mongoose');

module.exports = mongoose.model("staffedUsersStats", mongoose.Schema({
    id: String,
    staffedUsers: Array
}))