const mongoose = require('mongoose');

const restaurantSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    created_time: Date,
    restaurant_url: String,
    restaurant_info: {
        city: String,
        name: String,
        address: String,
        email: String,
        phone: String,

    }
});

module.exports = mongoose.model('Restaurant', restaurantSchema);