//const fmo_mgmt_backend = require('.') /* the current working directory so that means main.js because of package.json */
const start_restaurant_infos = require('./api/services/start-restaurant-infos')
//let theFile = process.argv[2] /* what the user enters as first argument */
//process.argv.forEach((val, index) => {
//    console.log(`${index}: ${val}`);
//});
let startFromBlock = process.argv[2];
console.log("bin.js => startFromBlock:" + startFromBlock);
let limit = process.argv[3];
console.log("bin.js => limit:" + limit);
let city = process.argv[4];
console.log("bin.js => city:" + city);
start_restaurant_infos.init2(startFromBlock, limit, city);