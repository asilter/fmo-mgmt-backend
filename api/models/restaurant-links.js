const mongoose = require('mongoose');

const restaurantLinkSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    created_time: Date,
    parent_restaurants_url: String,
    city: String,
    restaurant_urls: [
        {
            id: Number,
            uri: String
        }
    ]
});

module.exports = mongoose.model('restaurant_link', restaurantLinkSchema);