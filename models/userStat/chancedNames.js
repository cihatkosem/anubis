const mongoose = require('mongoose');

module.exports = mongoose.model("chancedNamesStats", mongoose.Schema({
    id: String,
    chancedNames: Array
}))