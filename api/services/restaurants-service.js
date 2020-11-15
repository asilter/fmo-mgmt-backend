const Restaurant = require('../models/restaurant');
//const https = require('http')
const https = require('https')
const config = require('./config/config.json');



class RestaurantsService {

    constructor() {
        console.log("RestaurantsService initialized");
    }


    //base_uri = "https://www.tripadvisor.com:1453/Restaurants-g186338-London_England.html";
    calculateHostnamePath(base_uri) {
        return new Promise((resolve, reject) => {
            let address_and_path;
            let _hostname;
            let _port;
            let _path;

            let _path_prefix_before_path_code;
            let _path_code;
            let _path_suffix_after_path_code;
            let bHttps = false;
            let bPortExists = false;

            let uriParams = {
                hostname: "",
                path: "",
                port: -1
            }

            if (base_uri.indexOf("http://") > -1) {
                address_and_path = base_uri.substring(base_uri.indexOf("http://") + 7);

            } else if (base_uri.indexOf("https://") > -1) {
                bHttps = true;
                address_and_path = base_uri.substring(base_uri.indexOf("https://") + 8);
            }
            console.log("address_and_path:" + address_and_path);
            if (address_and_path.indexOf(":") > -1) {
                // port var
                bPortExists = true;
                uriParams.port = address_and_path.substring(address_and_path.indexOf(":") + 1, address_and_path.indexOf("/"));
            } else {
                if (bHttps == true) {
                    uriParams.port = 443;
                } else {
                    uriParams.port = 80;
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

            console.log(JSON.stringify(uriParams));


            resolve(uriParams);

        });
    }

    listRestaurants(base_uri) {
        return new Promise((resolve, reject) => {
            /**
             * Code:
             * 001 : Restaurant Found
             * 002 : 
             * 003 : Restaurant Not Found
             * 004 : An Error Occured
             */

            let restaurantsResultObj = {
                code: "",
                message: "",
                resultObject: []
            }



            this.calculateHostnamePath(base_uri).then(resultRequest => {
                const options = {
                    hostname: resultRequest.hostname,
                    port: resultRequest.port,
                    path: resultRequest.path,
                    method: 'GET',
                    headers: {
                        'Content-Type': 'text/html'
                    }
                };
            });

            resolve(restaurantsResultObj);



        });
    }

}