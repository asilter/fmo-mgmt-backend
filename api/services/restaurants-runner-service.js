const mongoose = require('mongoose');
const RestaurantLinks = require('../models/restaurant-links');
const https = require('https')
const config = require('../../config/config.json');
const StringUtils = require('../utils/string-utils');
const fs = require('fs');
var parse = require('html-dom-parser');
var htmlclean = require('htmlclean');


class RestaurantsRunnerService {

    constructor() {
        //console.log("RestaurantsRunnerService initialized");
    }

    // Lists restaurants' links of html page
    persistBaseUrlRestaurants(base_uri, city) { 
        return new Promise((resolve, reject) => {
            let restaurantsResultObj = {
                code: "",
                message: "",
                resultObject: []
            }
            this.calculateHostnamePath(base_uri).then(resultRequest => {
                let _protocol = resultRequest.protocol;
                let _port = resultRequest.port;
                const options = {
                    hostname: resultRequest.hostname,
                    port: resultRequest.port,
                    path: resultRequest.path,
                    method: 'GET',
                    headers: {
                        'Content-Type': 'text/html'
                    }
                };
                restaurantsResultObj.resultObject = options;
                //console.log("_protocol:" + _protocol);

                // Handle web request
                this.makeWebRequest(restaurantsResultObj).then(taskResult => {

                    let dummyFileName = new StringUtils().generateAlphaNumericString(8).toUpperCase();
                    console.log("*\tdummyFileName:" + dummyFileName);

                    fs.writeFile(config.DEV.web_response_TA_tmp_file + "/" + dummyFileName + ".html", taskResult.resultObject, function (writeHtmlFileError) {
                        if (writeHtmlFileError) {
                            //console.log(writeHtmlFileError);
                            restaurantsResultObj.code = "004"
                            restaurantsResultObj.message = writeHtmlFileError.message;
                            restaurantsResultObj.resultObject = [];
                            reject(restaurantsResultObj);
                        } else {
                            // Read html response html file  
                            fs.readFile(config.DEV.web_response_TA_tmp_file + "/" + dummyFileName + ".html", 'utf8', function (readHtmlFileError, html) {
                                if (readHtmlFileError) {
                                    //console.log(readHtmlFileError);
                                    restaurantsResultObj.code = "004"
                                    restaurantsResultObj.message = readHtmlFileError.message;
                                    restaurantsResultObj.resultObject = [];
                                    fs.unlink(config.DEV.web_response_TA_tmp_file + "/" + dummyFileName + ".html", (res) => {
                                        console.log("file delete ok => res:" + res);
                                    });
                                    reject(restaurantsResultObj);
                                } else {
                                    console.log("*\tfile read ok");
                                    let _hostname = restaurantsResultObj.resultObject.hostname;

                                    restaurantsResultObj.resultObject = {
                                        "created_time": "",
                                        "parent_restaurants_url": base_uri,
                                        "city": city,
                                        "restaurant_urls": []
                                    };
                                    html = htmlclean(html);
                                    html = html.replace(/[\t\n\r]/gm, "");
                                    html = html.substring(html.indexOf("EATERY_SEARCH_RESULTS") - 9); 
                                    let dom = parse(html);
                                    let list_item;
                                    let restaurant_uri;
                                    let bUrlsOk = false;
                                    let urls_object = [];
                                    let restaurantCount = 0;
                                    let lastRestaurant;

                                    if (1 == 1) {
                                        //console.log("dom[0]:" + dom[0]);
                                        for (var i = 0; i < dom[0].children[1].children[0].children.length; i++) {
                                            list_item = dom[0].children[1].children[0].children[i];
                                            while (!list_item.attribs['data-test']) {
                                                list_item = list_item.next;
                                            }
                                            //console.log("list_item:"+list_item.children[0]);
                                            //console.log(list_item.attribs['data-test']);
                                            if (list_item.attribs['data-test'] == "SL_list_item") {
                                                restaurant_uri = _protocol + "://" + _hostname + ":" + _port + list_item.children[0].children[0].children[0].children[0].next.children[0].children[0].next.children[0].children[0].attribs['href'];
                                            } else {
                                                restaurant_uri = _protocol + "://" + _hostname + ":" + _port + list_item.children[0].children[0].children[0].next.children[0].children[0].children[0].children[0].attribs['href'];
                                            }
                                            //console.log("restaurant_uri:" + restaurant_uri);
                                            if (lastRestaurant == restaurant_uri) {
                                                continue;
                                            }
                                            if (restaurant_uri) {
                                                restaurantCount++;
                                                //console.log("restaurant_uri:" + restaurant_uri);
                                                urls_object.push({ "id": i, "uri": restaurant_uri });
                                                lastRestaurant = restaurant_uri;
                                                if (i == 0) bUrlsOk = true;
                                            }
                                        }
                                        console.log("*\trestaurantCount:" + restaurantCount);

                                        //console.log("*\tSome restaurant urls found:" + bUrlsOk);
                                        if (bUrlsOk) {
                                            // Database save operations
                                            //console.log("database operations");
                                            // Set variable to current date and time
                                            const _now = new Date();
                                            restaurantsResultObj.resultObject.created_time = _now;
                                            restaurantsResultObj.resultObject.restaurant_urls = urls_object;


                                            mongoose.connect('mongodb+srv://asilter:' + config.DEV.DB_PW + '@cluster0-1re2a.mongodb.net/fmo-mgmt?authSource=admin&replicaSet=Cluster0-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true', { useUnifiedTopology: true, useNewUrlParser: true });
                                            const connection = mongoose.connection;
                                            connection.once("open", function () {
                                                console.log("*\tDatabase connection established successfully");
                                                RestaurantLinks.insertMany(restaurantsResultObj.resultObject)
                                                    .then(insertRestaurantLinksResult => {
                                                        //console.log(insertRestaurantLinksResult);
                                                        restaurantsResultObj.code = "001"
                                                        restaurantsResultObj.message = "Operation Successful";
                                                        restaurantsResultObj.resultObject = restaurantsResultObj;
                                                        fs.unlink(config.DEV.web_response_TA_tmp_file + "/" + dummyFileName + ".html", (res) => {
                                                            //console.log("*\tfile delete ok => res:" + res);
                                                        });
                                                        resolve(restaurantsResultObj);
                                                    }).catch(insertRestaurantLinksError => {
                                                        console.log(insertRestaurantLinksError);
                                                        restaurantsResultObj.code = "004"
                                                        restaurantsResultObj.message = insertRestaurantLinksError.message;
                                                        restaurantsResultObj.resultObject = restaurantsResultObj;
                                                        fs.unlink(config.DEV.web_response_TA_tmp_file + "/" + dummyFileName + ".html", (res) => {
                                                            //console.log("*\tfile delete ok => res:" + res);
                                                        });
                                                        reject(restaurantsResultObj);
                                                    }).finally(() => {
                                                        connection.close(err => {
                                                            if (err) {
                                                                console.log("*\tDatabase connection closing problem => err:" + JSON.stringify(err));
                                                            } else {
                                                                console.log("*\tDatabase connection closed successfully");
                                                            }
                                                        });
                                                    });

                                            });
                                        }
                                    } else {
                                        restaurantsResultObj.code = "004"
                                        restaurantsResultObj.message = "An error occured in html format as [dom]";
                                        restaurantsResultObj.resultObject = [];
                                        fs.unlink(config.DEV.web_response_TA_tmp_file + "/" + dummyFileName + ".html", (res) => {
                                            console.log("file delete ok => res:" + res);
                                        });
                                        reject(restaurantsResultObj);
                                    }
                                }
                            });
                        }
                    });
                }).catch(taskError => {
                    console.log(JSON.stringify(taskError));
                    restaurantsResultObj.code = "004";
                    restaurantsResultObj.message = "An error occured";
                    restaurantsResultObj.resultObject = taskError;
                    reject(restaurantsResultObj);
                });;
            });
        });
    }

    makeWebRequest(requestOptions) {

        //console.log("makeWebRequest() requestOptions => " + JSON.stringify(requestOptions));

        return new Promise((resolve, reject) => {

            let WebRequestResultObj = {
                code: "",
                message: "",
                resultObject: []
            }

            //console.log("just before request => requestOptions:" + JSON.stringify(requestOptions));
            const req = https.request(requestOptions.resultObject, res => {
                console.log("*\tstatusCode:" + res.statusCode);
                var totalData = "";

                // Response Data Loop Event
                res.on('data', d => {
                    totalData = totalData + d;
                });

                // Response Data Ended Event
                res.on('end', () => {

                    WebRequestResultObj.code = "001"
                    WebRequestResultObj.message = "Web Response Successfull";
                    WebRequestResultObj.resultObject = totalData;
                    resolve(WebRequestResultObj);

                });
            });

            // Request Error Event
            req.on('error', requestError => {
                console.log("Failed!");
                WebRequestResultObj.code = "004"
                WebRequestResultObj.message = requestError.message;
                reject(WebRequestResultObj);
            });

            // Close web request object
            req.end();

        });
    }

    //base_uri = "https://www.tripadvisor.com/Restaurants-g186338-London_England.html";
    calculateHostnamePath(base_uri) {
        return new Promise((resolve, reject) => {
            let address_and_path;
            let _path_prefix_before_path_code;
            let _path_suffix_after_path_code;

            let _path_code;
            let bHttps = false;
            let bPortExists = false;

            let uriParams = {
                hostname: "",
                path: "",
                port: "",
                protocol: ""
            }

            //console.log("base_uri:" + base_uri);
            if (base_uri.indexOf("http://") > -1) {
                address_and_path = base_uri.substring(base_uri.indexOf("http://") + 7);
                uriParams.protocol = "http";
            } else if (base_uri.indexOf("https://") > -1) {
                bHttps = true;
                address_and_path = base_uri.substring(base_uri.indexOf("https://") + 8);
                uriParams.protocol = "https";
            }
            //console.log("address_and_path:" + address_and_path);
            if (address_and_path.indexOf(":") > -1) {
                // port var
                bPortExists = true;
                uriParams.port = address_and_path.substring(address_and_path.indexOf(":") + 1, address_and_path.indexOf("/"));
            } else {
                if (bHttps == true) {
                    uriParams.port = "443";
                } else {
                    uriParams.port = "80";
                }
            }
            if (bPortExists) {
                uriParams.hostname = address_and_path.substring(0, address_and_path.indexOf(":"));
            } else {
                uriParams.hostname = address_and_path.substring(0, address_and_path.indexOf("/"));
            }

            uriParams.path = address_and_path.substring(address_and_path.indexOf("/"));

            //_path_code = uriParams.path.substring(uriParams.path.indexOf("/Restaurants-") + 13).substring(0, 7);
            _path_code = uriParams.path.substring(uriParams.path.indexOf("/Restaurants-") + 13).substring(0, 6);
            _path_prefix_before_path_code = uriParams.path.substring(0, uriParams.path.indexOf(_path_code));
            //_path_suffix_after_path_code = uriParams.path.substring(uriParams.path.indexOf(_path_code) + 7);
            _path_suffix_after_path_code = uriParams.path.substring(uriParams.path.indexOf(_path_code) + 6);

            //console.log("_path_prefix_before_path_code:" + _path_prefix_before_path_code);
            //console.log("_path_code:" + _path_code);
            //console.log("_path_suffix_after_path_code:" + _path_suffix_after_path_code);

            //console.log(JSON.stringify(uriParams));


            resolve(uriParams);

        });
    }

}

module.exports = RestaurantsRunnerService;