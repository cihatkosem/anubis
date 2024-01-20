const mongoose = require('mongoose');

module.exports = mongoose.model("products", mongoose.Schema({
    id: String,
    name: String,//adı
    price: Number,//fiyatı
}))