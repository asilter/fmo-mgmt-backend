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
        console.log("*\tWorking ...");
        const rirs = new RestaurantInfoRunnerService();
        rirs.persistRestaurantInfo(restaurantParserOptions).then(result => {
            //console.log("result:" + result);
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
function generateTasks(taskRunnerOptionsList, connection) {
    // DB Operations : List Restaurant links 
    //console.log("generateTasks ****** ");
    const tasks = [];
    let num = 0;
    let interval;
    let counter = 0;
    let minSec = 35;
    let maxSec = 45;
    for (let i = 0; i < taskRunnerOptionsList.length; i++) {
        tasks.push(done => {
            setTimeout(() => {
                // minSec between maxSec secs
                num = Math.ceil(Math.random() * 100);
                num = num - 3;
                if (num < minSec) {
                    while (num < minSec) {
                        num = num + 10;
                    }
                } else {
                    while (num > maxSec) {
                        num = num - 10;
                    }
                }
                // seconds transformation
                interval = num * 1000;

                console.log("****************************************");
                console.log("*\tPage " + taskRunnerOptionsList[i].startPage + " to " + taskRunnerOptionsList[i].endPage + "\t");
                console.log("*\tPage(Block) Number : " + taskRunnerOptionsList[i].block_number);
                console.log("*\tRestaurant Order : " + taskRunnerOptionsList[i].restaurant_order);

                console.log("*\tNext Request : After " + num + " secs");
                task(taskRunnerOptionsList[i]).then(taskResult => {
                    //console.log("Task Result : " + taskResult);
                    console.log("*\t" + (taskRunnerOptionsList.length - i) + " items left!\t");
                    console.log("****************************************");
                    if (i == taskRunnerOptionsList.length - 1) {
                        connection.close(err => {
                            if (err) {
                                console.log("Database connection closing problem => err:" + JSON.stringify(err));
                            } else {
                                console.log("Database connection closed :)");
                            }
                        });
                    }
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
        //let DBCityChangedStarttingPoint = 659;

        /*
        mongoose.connect('mongodb+srv://asilter:' + config.DEV.DB_PW + '@cluster0-1re2a.mongodb.net/fmo-mgmt?authSource=admin&replicaSet=Cluster0-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true', { useUnifiedTopology: true, useNewUrlParser: true });
        const connection = mongoose.connection;
        connection.once("open", function () {
            console.log("database connection opened");
            */
        //RestaurantLinks.find({}).skip(DBCityChangedStarttingPoint + taskRunnerOptions.startFromBlock).limit(taskRunnerOptions.limit)
        RestaurantLinks.find({ city: "Dubai" }).skip(taskRunnerOptions.startFromBlock).limit(taskRunnerOptions.limit)
            .exec()
            .then(restaurantLinksResult => {
                //let blockNumber = taskRunnerOptions.startFromBlock;
                let blockNumber = taskRunnerOptions.startFromBlock;
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
                                "restaurant_order": restaurantNumber,
                                "startPage": taskRunnerOptions.startFromBlock,
                                "endPage": taskRunnerOptions.startFromBlock + taskRunnerOptions.limit
                            }
                        );
                        restaurantNumber++;
                    }
                    blockNumber++;
                    restaurantNumber = 0;
                }
                resolve(taskRunnerOptionsList);
            }).catch(restaurantLinksError => {
                console.log(JSON.stringify(restaurantLinksError));
            });
        /*
        .finally(() => {
            connection.close(err => {
                if (err) {
                    console.log("Database connection closing problem => err:" + JSON.stringify(err));
                } else {
                    console.log("Database connection closed successfully");
                }
            });
            //console.log("after for ****** => taskRunnerOptionsList:" + JSON.stringify(taskRunnerOptionsList));
            resolve(taskRunnerOptionsList);
        });
        */

    });
}


let taskRunnerOptions = {
    //"startFromBlock": 40,
    "startFromBlock": 200,
    //"limit": 60,
    "limit": 100,
    "city": "London"
}

function init() {

    mongoose.connect('mongodb+srv://asilter:' + config.DEV.DB_PW + '@cluster0-1re2a.mongodb.net/fmo-mgmt?authSource=admin&replicaSet=Cluster0-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true', { useUnifiedTopology: true, useNewUrlParser: true });
    const connection = mongoose.connection;

    const runner = new TaskRunner();
    runner.setConcurrency(1);

    getAddresses(taskRunnerOptions).then(result => {
        runner.addMultiple(generateTasks(result, connection));
    });
}
//init();


module.exports.init2 = function (_startFromBlokParam, _limitParam, _city) {
    taskRunnerOptions.startFromBlock = Number(_startFromBlokParam);
    taskRunnerOptions.limit = Number(_limitParam);
    taskRunnerOptions.city = _city;
    init();
}
