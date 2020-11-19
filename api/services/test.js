const mongoose = require('mongoose');
const config = require('../../config/config.json');
const RestaurantsRunnerService = require('./restaurants-runner-service');

//mongoose.connect('mongodb+srv://asilter:' + config.DEV.DB_PW + '@cluster0-1re2a.mongodb.net/fmo-mgmt?authSource=admin&replicaSet=Cluster0-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true', null);

const test_uri = "https://www.tripadvisor.com/Restaurants-g186338-London_England.html";
const rrs = new RestaurantsRunnerService();

rrs.testPromise(test_uri).then(result => {
    console.log("result:" + result);
}).catch(err => {
    console.log("error:" + err);
})

/*
rrs.listRestaurants(test_uri).then(result => {
    console.log("list restaurants ok !");
    console.log("result:" + JSON.stringify(result));
    resolve(true);
}).catch(error => {
    console.log("error:" + JSON.stringify(error));
});
*/



