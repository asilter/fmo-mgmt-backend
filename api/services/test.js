const mongoose = require('mongoose');
const config = require('../../config/config.json');
const RestaurantsRunnerService = require('./restaurants-runner-service');


console.log(Math.random().toString(36).substr(2, 8).toUpperCase());
const test_uri = "https://www.tripadvisor.com/Restaurants-g186338-London_England.html";
const rrs = new RestaurantsRunnerService();
rrs.listRestaurants(test_uri).then(result => {
    console.log("result:" + result);
}).catch(err => {
    console.log("error:" + err);
});



