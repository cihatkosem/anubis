const mongoose = require('mongoose')

module.exports = mongoose.model("users", mongoose.Schema({
    id: String,
    displayname: String,
    register: {
        name: String,
        age: Number,
        gender: String,
        date: String,
        executorId: String,
    },
    roles: Array,
    coin: Number,
    _coin: Number,
    afk: {
        status: Boolean,
        reason: String
    },
    staff: {
        authority: {
            roleId: String,
            date: String,
            executorId: String
        },
        responsibilities: Array
    }
}))