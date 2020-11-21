const mongoose = require('mongoose');
const config = require('../../config/config.json');
var TaskRunner = require('concurrent-tasks');
const RestaurantInfoRunnerService = require('./restaurant-info-runner-service');



//let base_uri = "https://www.tripadvisor.com/Restaurant_Review-g186338-d13474320-Reviews-Latitude_Wimbledon-London_England.html";
let base_uri = "https://www.tripadvisor.com/Restaurant_Review-g186338-d15021904-Reviews-The_Chelsea_Corner-London_England.html";
let rirs = new RestaurantInfoRunnerService();
rirs.persistRestaurantInfo(base_uri).then(result => {
    console.log("result:" + result);
    console.log(Math.random());
    //resolve(result);
}).catch(err => {
    console.log("error:" + err);
    //reject(err);
});