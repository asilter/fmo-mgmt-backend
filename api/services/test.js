const mongoose = require('mongoose');
const config = require('../../config/config.json');
var TaskRunner = require('concurrent-tasks');
const RestaurantInfoRunnerService = require('./restaurant-info-runner-service');
const RestaurantLinks = require('../models/restaurant-links');



/**
 * 
 * restaurantParserOptions:
 * {
        "city": taskRunnerOptions.city,
        "parent_restaurants_url": dummyBlock.parent_restaurants_url,
        "block_number": blockNumber,
        "restaurant_url": dummyRestaurant.uri,
        "restaurant_order": restaurantNumber
    }
 */
function task(restaurantParserOptions) {
    return new Promise((resolve, reject) => {
        console.log("Working ...");
        const rirs = new RestaurantInfoRunnerService();
        rirs.persistRestaurantInfo(restaurantParserOptions).then(result => {
            console.log("result:" + result);
            resolve(result);
        }).catch(err => {
            console.log("error:" + err);
            reject(err);
        });
    });
}



/**
 * taskRunnerOptionsList
 * [
 *      {
            "city": taskRunnerOptions.city,
            "parent_restaurants_url": dummyBlock.parent_restaurants_url,
            "block_number": blockNumber,
            "restaurant_url": dummyRestaurant.uri,
            "restaurant_order": restaurantNumber
        },
        {
            ...
        }
    ]
 * */
function generateTasks(taskRunnerOptionsList) {
    // DB Operations : List Restaurant links 
    console.log("generateTasks ****** ");
    const tasks = [];
    let num = 0;
    let interval;
    let counter = 0;

    for (let i = 0; i < taskRunnerOptionsList.length; i++) {
        tasks.push(done => {
            setTimeout(() => {
                // 35 between 45 secs
                num = Math.ceil(Math.random() * 100);
                num = num - 3;
                if (num < 35) {
                    while (num < 35) {
                        num = num + 10;
                    }
                } else {
                    while (num > 45) {
                        num = num - 10;
                    }
                }
                // seconds transformation
                interval = num * 1000;
                console.log("interval : " + num + " sn");
                task(taskRunnerOptionsList[i]).then(taskResult => {
                    console.log("Task Result : " + taskResult);
                    done();
                }).catch(taskError => {
                    console.log("Task Error : " + JSON.stringify(taskError));
                    done();
                });
            }, interval);
        });
        counter++;
    }
    return tasks;
}

//https://www.tripadvisor.com.tr/Restaurants-g186338-oa30-London_England.html
function getAddresses(taskRunnerOptions) {
    return new Promise((resolve, reject) => {

        let taskRunnerOptionsList = [];

        

        mongoose.connect('mongodb+srv://asilter:' + config.DEV.DB_PW + '@cluster0-1re2a.mongodb.net/fmo-mgmt?authSource=admin&replicaSet=Cluster0-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true', { useUnifiedTopology: true, useNewUrlParser: true });
        const connection = mongoose.connection;
        connection.once("open", function () {
            console.log("database connection opened");
            RestaurantLinks.find({}).skip(taskRunnerOptions.startFromBlock).limit(taskRunnerOptions.limit)
                .exec()
                .then(restaurantLinksResult => {

                    let blockNumber = 0;
                    let restaurantNumber = 0;
                    let dummyBlock;
                    let dummyRestaurant;
                    //console.log(JSON.stringify(restaurantLinksResult));
                    for (var i = 0; i < restaurantLinksResult.length; i++) {
                        dummyBlock = restaurantLinksResult[i];
                        for (var j = 0; j < dummyBlock.restaurant_urls.length; j++) {
                            dummyRestaurant = dummyBlock.restaurant_urls[j];
                            taskRunnerOptionsList.push(
                                {
                                    "city": taskRunnerOptions.city,
                                    "parent_restaurants_url": dummyBlock.parent_restaurants_url,
                                    "block_number": blockNumber,
                                    "restaurant_url": dummyRestaurant.uri,
                                    "restaurant_order": restaurantNumber
                                }
                            );
                            restaurantNumber++;
                        }
                        blockNumber++;
                    }
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
                    //console.log("after for ****** => taskRunnerOptionsList:" + JSON.stringify(taskRunnerOptionsList));
                    resolve(taskRunnerOptionsList);
                });
        });
    });
}

function init() {
    const runner = new TaskRunner();
    runner.setConcurrency(1);
    getAddresses(taskRunnerOptions).then(result => {
        //console.log(" =========================> " + JSON.stringify(result));
        runner.addMultiple(generateTasks(result));
    });
}

let taskRunnerOptions = {
    "startFromBlock": 0,
    "limit": 10,
    "city": "London"
}

init();