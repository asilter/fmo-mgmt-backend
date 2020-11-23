const mongoose = require('mongoose');
const config = require('../../config/config.json');
var TaskRunner = require('concurrent-tasks');
const RestaurantInfoRunnerService = require('./restaurant-info-runner-service');
const RestaurantLinks = require('../models/restaurant-links');



function listRestaurantLinks() {
    // DB Operations : List Restaurant links 
    mongoose.connect('mongodb+srv://asilter:' + config.DEV.DB_PW + '@cluster0-1re2a.mongodb.net/fmo-mgmt?authSource=admin&replicaSet=Cluster0-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true', { useUnifiedTopology: true, useNewUrlParser: true });
    const connection = mongoose.connection;
    connection.once("open", function () {
        RestaurantLinks.find({}).skip(0).limit(3)
            .exec()
            .then(restaurantLinksResult => {
                console.log(JSON.stringify(restaurantLinksResult));
            }).catch(restaurantLinksError => {
                console.log(JSON.stringify(restaurantLinksError));
            }).finally(() => {
                connection.close(err => {
                    if (err) {
                        console.log("MongoDB database connection closing problem => err:" + JSON.stringify(err));
                    } else {
                        console.log("MongoDB database connection closed successfully");
                    }
                });
            });
    });
}
listRestaurantLinks();


/*
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
*/