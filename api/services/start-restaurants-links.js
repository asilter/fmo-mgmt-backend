const mongoose = require('mongoose');
const config = require('../../config/config.json');
var TaskRunner = require('concurrent-tasks');
const RestaurantsRunnerService = require('./restaurants-runner-service');





function task(base_uri) {
    return new Promise((resolve, reject) => {
        console.log("Working ...");
        const rrs = new RestaurantsRunnerService();
        rrs.persistBaseUrlRestaurants(base_uri).then(result => {
            console.log("result:" + result);
            resolve(result);
        }).catch(err => {
            console.log("error:" + err);
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
        if (taskRunnerOptions.startFrom == 0) {
            taskRunnerOptions.restaurant_uris.push(taskRunnerOptions.base_uri);
        }
        for (let i = taskRunnerOptions.startFrom; i < taskRunnerOptions.startFrom + taskRunnerOptions.taskCount; i++) {
            uri_dummy = taskRunnerOptions.base_uri;
            path_code = uri_dummy.substring(uri_dummy.indexOf("/Restaurants-") + 13).substring(0, 7);
            uri_dummy_result = uri_dummy.substring(0, uri_dummy.indexOf(path_code) + 7);
            uri_dummy_result = uri_dummy_result + "-oa" + (i + 1) * 30 + uri_dummy.substring(uri_dummy.indexOf(path_code) + 7);
            taskRunnerOptions.restaurant_uris.push(uri_dummy_result);
        }
        resolve(taskRunnerOptions);
    });
}

function generateTasks(taskRunnerOptions) {
    const tasks = [];
    let num = 0;
    let interval;
    for (let i = 0; i < taskRunnerOptions.restaurant_uris.length; i++) {
        tasks.push(done => {
            setTimeout(() => {
                // 0 between 9
                num = Math.floor(Math.random() * 10);
                if (num < 3) {
                    num = 3;
                }
                // between 30 and 90
                num = num * 10;
                // minutes transformation
                //interval = interval * 1000 * 60;
                // seconds transformation
                interval = num * 1000;
                //console.log("interval : " + interval / 1000 / 60 + " dk");
                console.log("interval : " + num + " sn");
                task(taskRunnerOptions.restaurant_uris[i]).then(taskResult => {
                    console.log("Task Result : " + taskResult);
                    done();
                }).catch(taskError => {
                    console.log("Task Error : " + taskError);
                    done();
                });
            }, interval);
        });
    }
    return tasks;
}

function init(taskRunnerOptions) {
    const runner = new TaskRunner();
    runner.setConcurrency(1);
    getAddresses(taskRunnerOptions).then(result => {
        console.log(JSON.stringify(result));
        runner.addMultiple(generateTasks(result));
    });

}

let taskRunnerOptions = {
    "base_uri": "https://www.tripadvisor.com/Restaurants-g186338-London_England.html",
    "taskCount": 2,
    "startFrom": 660,
    "restaurant_uris": []
}
init(taskRunnerOptions);






