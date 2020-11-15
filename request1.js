//const https = require('http')
const https = require('https')
const config = require('./config/config.json');

const options = {
    hostname: 'www.tripadvisor.com',
    port: 443,
    path: '/Restaurants-g186338-London_England.html',
    method: 'GET',
    headers: {
        'Content-Type': 'text/html'
    }
};

var totalData = "";
const req = https.request(options, res => {
    console.log("statusCode:" + res.statusCode);
    res.on('data', d => {
        totalData = totalData + d;
        //console.log(totalData.length);
        //console.log("data (d) : " + d);
    });
    res.on('end', () => {
        console.log(totalData.length);
        const fs = require('fs');
        
        fs.writeFile(config.DEV.web_response_TA_tmp_file, totalData, function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        });
        
        // Or
        //fs.writeFileSync('/tmp/tripadvisor.txt', totalData);
    })
});

req.on('error', error => {
    console.log("Failed!");
    console.error(error);
});



req.end();



