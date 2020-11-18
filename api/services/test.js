const RestaurantsRunnerService = require('./restaurants-runner-service');


const test_uri = "https://www.tripadvisor.com/Restaurants-g186338-London_England.html";
const rrs = new RestaurantsRunnerService();
rrs.listRestaurants(test_uri).then(result => {
    console.log("result:" + JSON.stringify(result));
}).catch(error => {
    console.log("result:" + JSON.stringify(error));
});



