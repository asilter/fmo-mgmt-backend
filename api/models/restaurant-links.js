const mongoose = require('mongoose');

const restaurantLinkSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    parent_restaurants_url: String,
    restaurant_urls: [
        {
            id: Number,
            uri: String
        }
    ]
});

module.exports = mongoose.model('restaurant_link', restaurantLinkSchema);