const mongoose = require('mongoose');
var decode = require('decode-html');
const RestaurantLinks = require('../models/restaurant-links');
const Restaurant = require('../models/restaurant');
const RestaurantErrorLog = require('../models/restaurant-error-log');
const https = require('https')
const config = require('../../config/config.json');
var parse = require('html-dom-parser');
var htmlclean = require('htmlclean');
var decodeHtml = require('decode-html');


class RestaurantInfoRunnerService {

    constructor() {
        console.log("RestaurantInfoRunnerService initialized");
    }


    /**
     * restaurantParserOptions:
     * {
            "city": taskRunnerOptions.city,
            "parent_restaurants_url": dummyBlock.parent_restaurants_url,
            "block_number": blockNumber,
            "restaurant_url": dummyRestaurant.uri,
            "restaurant_order": restaurantNumber
        }
     */
    persistRestaurantInfo(restaurantParserOptions) {
        return new Promise((resolve, reject) => {
            let restaurantInfoResultObj = {
                code: "",
                message: "",
                resultObject: {}
            }

            this.calculateHostnamePath(restaurantParserOptions.restaurant_url).then(resultRequest => {
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
                //console.log(options);
                restaurantInfoResultObj.resultObject = options;
                console.log("_protocol:" + _protocol);

                // Handle web request
                this.makeWebRequest(restaurantInfoResultObj).then(taskResult => {
                    console.log("make web request result");
                    let html = taskResult.resultObject;
                    //console.log("html : " + html);

                    let restaurantInfo = {
                        "created_time": "",
                        "restaurant_url": restaurantParserOptions.restaurant_url,
                        "restaurant_info": {
                            "city": "",
                            "name": "",
                            "address": "",
                            "email": "",
                            "phone": ""
                        }
                    };

                    restaurantInfo.restaurant_info.city = restaurantParserOptions.city;

                    let name;
                    let address;
                    let email = "N/A";
                    let phone;

                    html = htmlclean(html);
                    html = html.replace(/[\t\n\r]/gm, "");

                    //let html2 = html.substring(html.indexOf("tr9HFDVo") - 12);
                    //let html2 = html.substring(html.indexOf("TABS_OVERVIEW") - 32);
                    //let dom2 = parse(html2);



                    html = html.substring(html.indexOf("taplc_top_info_0") - 9);
                    let dom = parse(html);

                    // Name
                    //console.log(dom[0].children[0].children[0].children[0].children[0].children[0].data);
                    name = dom[0].children[0].children[0].children[0].children[0].children[0].data
                    //name = decodeHtml(name);
                    name = decode(name);
                    console.log("Name\t:\t" + name);
                    restaurantInfo.restaurant_info.name = name;


                    // Address
                    html = html.substring(html.indexOf("xAOpeG9l") - 12);
                    dom = parse(html);
                    let addressNode = dom[0].children[0].next.next.children[0].next.children[0].children[0].children[0];
                    address = addressNode.data;
                    address = decodeHtml(address);
                    console.log("Address\t:\t" + address);
                    restaurantInfo.restaurant_info.address = address;


                    // ANA NODE xAOpeG9l : addressNode.parent.parent.parent.parent.parent

                    let html3 = html.substring(html.indexOf("_105c0u5l") - 12);
                    let dom3 = parse(html3);
                    //console.log("CHILDREN 0    ****************************************************");
                    let emailNode;
                    emailNode = dom3[0].children[0].next;
                    //console.log(emailNode);
                    if (emailNode.children.length > 0) {
                        //console.log(emailNode.children[0]);
                        email = emailNode.children[0].children[0].attribs["href"];
                        email = email.substring(email.indexOf("mailto:") + 7);
                        email = email.substring(0, email.indexOf("?"));
                    }
                    //console.log("CHILDREN 0    ****************************************************");
                    console.log("E-Mail\t:\t" + email);
                    restaurantInfo.restaurant_info.email = email;

                    dom3 = null;

                    // Second _105c0u5l : addressNode.parent.parent.parent.parent.parent.children[4].next.next
                    /* 
                     let phoneNode;
                     phoneNode = addressNode.parent.parent.parent.parent.parent.children[4].next.next;
                     phone = phoneNode.children[0].children[0].attribs["href"];
                     phone = phone.substring(phone.indexOf("tel:") + 4);
                     */
                    phone = "N/A";
                    console.log("Phone\t:\t" + phone);
                    restaurantInfo.restaurant_info.phone = phone;

                    dom = null;

                    // Database save operations
                    console.log("database operations");
                    // Set variable to current date and time
                    const _now = new Date();
                    restaurantInfo.created_time = _now;

                    console.log(JSON.stringify(restaurantInfo));

                    mongoose.connect('mongodb+srv://asilter:' + config.DEV.DB_PW + '@cluster0-1re2a.mongodb.net/fmo-mgmt?authSource=admin&replicaSet=Cluster0-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true', { useUnifiedTopology: true, useNewUrlParser: true });
                    const connection = mongoose.connection;
                    connection.once("open", function () {
                        console.log("Database connection established successfully");
                        Restaurant.insertMany(restaurantInfo)
                            .then(insertRestaurantResult => {
                                //console.log(insertRestaurantResult);
                                restaurantInfoResultObj.code = "001"
                                restaurantInfoResultObj.message = "Operation Successful";
                                restaurantInfoResultObj.resultObject = restaurantInfo;
                                resolve(restaurantInfoResultObj);
                            }).catch(insertRestaurantError => {
                                //console.log(insertRestaurantError);
                                console.log("HATA *** :" + JSON.stringify(restaurantParserOptions));
                                restaurantInfoResultObj.code = "004"
                                restaurantInfoResultObj.message = insertRestaurantError.message;
                                restaurantInfoResultObj.resultObject = restaurantInfo;
                                reject(restaurantInfoResultObj);
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
                }).catch(taskError => {
                    console.log(JSON.stringify(taskError));

                    mongoose.connect('mongodb+srv://asilter:' + config.DEV.DB_PW + '@cluster0-1re2a.mongodb.net/fmo-mgmt?authSource=admin&replicaSet=Cluster0-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true', { useUnifiedTopology: true, useNewUrlParser: true });
                    const connection = mongoose.connection;
                    connection.once("open", function () {
                        console.log("Adding to database: " + JSON.stringify(restaurantParserOptions));
                        RestaurantErrorLog.insertMany(restaurantParserOptions)
                            .then(insertRestaurantErrorLogResult => {
                                console.log("database log ok");
                                //console.log(insertRestaurantErrorLogResult);
                                restaurantInfoResultObj.code = "001"
                                restaurantInfoResultObj.message = "Operation Successful";
                                restaurantInfoResultObj.resultObject = restaurantParserOptions;
                                resolve(restaurantInfoResultObj);
                            }).catch(insertRestaurantErrorLogError => {
                                console.log("database log error => insertRestaurantErrorLogError : " + JSON.stringify(insertRestaurantErrorLogError));
                                //console.log(insertRestaurantErrorLogError);
                                restaurantInfoResultObj.code = "004"
                                restaurantInfoResultObj.message = insertRestaurantErrorLogError.message;
                                restaurantInfoResultObj.resultObject = restaurantParserOptions;
                                reject(restaurantInfoResultObj);
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


                    restaurantInfoResultObj.code = "004";
                    restaurantInfoResultObj.message = taskError.message;
                    restaurantInfoResultObj.resultObject = taskError;

                    reject(restaurantInfoResultObj);
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
                console.log("statusCode:" + res.statusCode);
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

    //base_uri = "https://www.tripadvisor.com/Restaurant_Review-g186338-d15021904-Reviews-The_Chelsea_Corner-London_England.html";
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

            _path_code = uriParams.path.substring(uriParams.path.indexOf("/Restaurants-") + 13).substring(0, 7);
            _path_prefix_before_path_code = uriParams.path.substring(0, uriParams.path.indexOf(_path_code));
            _path_suffix_after_path_code = uriParams.path.substring(uriParams.path.indexOf(_path_code) + 7);

            console.log("_path_prefix_before_path_code:" + _path_prefix_before_path_code);
            console.log("_path_code:" + _path_code);
            console.log("_path_suffix_after_path_code:" + _path_suffix_after_path_code);

            //console.log(JSON.stringify(uriParams));


            resolve(uriParams);

        });
    }

}

module.exports = RestaurantInfoRunnerService;