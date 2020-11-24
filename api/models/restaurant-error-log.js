const mongoose = require('mongoose');

const restaurantErrorLogSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    city: String,
    parent_restaurants_url: String,
    block_number: Number,
    restaurant_url: String,
    restaurant_order: Number
});

module.exports = mongoose.model('Restaurant-Error-Log', restaurantErrorLogSchema);