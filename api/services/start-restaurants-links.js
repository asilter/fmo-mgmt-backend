const mongoose = require('mongoose');
const config = require('../../config/config.json');
var TaskRunner = require('concurrent-tasks');
const RestaurantsRunnerService = require('./restaurants-runner-service');





function task(base_uri, city) {
    return new Promise((resolve, reject) => {
        console.log("*\tWorking ...");
        const rrs = new RestaurantsRunnerService();
        rrs.persistBaseUrlRestaurants(base_uri, city).then(result => {
            //console.log("result:" + result);
            resolve(result);
        }).catch(err => {
            console.log("*\terror:" + err);
            reject(err);
        });
    });
}

//https://www.tripadvisor.com.tr/Restaurants-g186338-oa30-London_England.html
function getAddresses(taskRunnerOptions) {
    return new Promise((resolve, reject) => {
        let uri_dummy = "";
        let uri_dummy_result = "";
        let path_code = "";
        if (taskRunnerOptions.startFromBlock == 0) {
            taskRunnerOptions.restaurant_uris.push(taskRunnerOptions.base_uri);
        }
        for (let i = taskRunnerOptions.startFromBlock; i < taskRunnerOptions.startFromBlock + taskRunnerOptions.limit; i++) {
            uri_dummy = taskRunnerOptions.base_uri;
            //path_code = uri_dummy.substring(uri_dummy.indexOf("/Restaurants-") + 13).substring(0, 7);
            path_code = uri_dummy.substring(uri_dummy.indexOf("/Restaurants-") + 13).substring(0, taskRunnerOptions.cityCodeLength);
            //uri_dummy_result = uri_dummy.substring(0, uri_dummy.indexOf(path_code) + 7);
            uri_dummy_result = uri_dummy.substring(0, uri_dummy.indexOf(path_code) + taskRunnerOptions.cityCodeLength);
            //uri_dummy_result = uri_dummy_result + "-oa" + (i + 1) * 30 + uri_dummy.substring(uri_dummy.indexOf(path_code) + 7);
            uri_dummy_result = uri_dummy_result + "-oa" + (i + 1) * 30 + uri_dummy.substring(uri_dummy.indexOf(path_code) + taskRunnerOptions.cityCodeLength);

            taskRunnerOptions.restaurant_uris.push(uri_dummy_result);
        }
        resolve(taskRunnerOptions);
    });
}

function generateTasks(taskRunnerOptions) {
    const tasks = [];
    let num = 0;
    let interval;
    let minSec = 35;
    let maxSec = 45;
    console.log("*******************");
    console.log("*\t" + taskRunnerOptions.startFromBlock + " to " + + Number(Number(taskRunnerOptions.startFromBlock) + Number(taskRunnerOptions.limit)));
    for (let i = 0; i < taskRunnerOptions.restaurant_uris.length; i++) {
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
                //console.log("interval : " + interval / 1000 / 60 + " dk");
                console.log("*\tinterval : " + num + " sn");
                console.log("*\tBlock Count:" + Number(Number(taskRunnerOptions.startFromBlock) + Number(i)));
                task(taskRunnerOptions.restaurant_uris[i], taskRunnerOptions.city).then(taskResult => {
                    //console.log("Task Result : " + taskResult);
                    done();
                }).catch(taskError => {
                    console.log("*\tTask Error : " + taskError);
                    done();
                });
            }, interval);
        });
    }
    return tasks;
}


let taskRunnerOptions = {
    //"base_uri": "https://www.tripadvisor.com/Restaurants-g186338-London_England.html",
    //"base_uri": "https://www.tripadvisor.com/Restaurants-g60763-New_York_City_New_York.html",
    "base_uri": "https://www.tripadvisor.com.tr/Restaurants-g303631-Sao_Paulo_State_of_Sao_Paulo2.html",
    //"taskCount": 1, //NYC : 376, London : 662
    "limit": 1,
    //"startFrom": 0,
    "startFromBlock": 0,
    "restaurant_uris": [],
    "city": "SaoPaulo", // Dubai
    "cityCodeLength": 7 // 6
}

function init() {
    const runner = new TaskRunner();
    runner.setConcurrency(1);
    getAddresses(taskRunnerOptions).then(result => {
        console.log(JSON.stringify(result));
        runner.addMultiple(generateTasks(result));
    });

}
//init();

module.exports.init2 = function (_restaurants_links_url, _startFromBlokParam, _limitParam, _city, _cityCodeLength) {
    taskRunnerOptions.base_uri = _restaurants_links_url;
    taskRunnerOptions.startFromBlock = Number(_startFromBlokParam);
    taskRunnerOptions.limit = Number(_limitParam);
    taskRunnerOptions.city = _city;
    taskRunnerOptions.cityCodeLength = Number(_cityCodeLength);
    init();
}






