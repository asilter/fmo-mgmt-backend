//const fmo_mgmt_backend = require('.') /* the current working directory so that means main.js because of package.json */
const start_restaurants_links = require('./api/services/start-restaurants-links')
//let theFile = process.argv[2] /* what the user enters as first argument */
//process.argv.forEach((val, index) => {
//    console.log(`${index}: ${val}`);
//});
let restaurants_links_url = process.argv[2];
console.log("bin.js => restaurants_links_url:" + restaurants_links_url);
let startFromBlock = process.argv[3];
console.log("bin.js => startFromBlock:" + startFromBlock);
let limit = process.argv[4];
console.log("bin.js => limit:" + limit);
let city = process.argv[5];
console.log("bin.js => city:" + city);
let cityCodeLength = process.argv[6];
start_restaurants_links.init2(restaurants_links_url, startFromBlock, limit, city, cityCodeLength);
