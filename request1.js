var request = require('request');

request({

    uri: "http://example.com",

}, function (error, response, body) {
    
    console.log(body);


    
});