const mongoose = require('mongoose');

const restaurantSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    email: String,
    location: String
});

module.exports = mongoose.model('Restaurant', restaurantSchema);