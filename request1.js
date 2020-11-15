//const https = require('http')
const https = require('https')

const options = {
    //hostname: 'example.com',
    hostname: 'www.tripadvisor.com',
    //port: 80,
    port: 443,
    //path: '/',
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
        
        fs.writeFile("/Users/asilter/Documents/WORK/PROJECTS/fleet-menu-order/fmo-mgmt/source-code/fmo-mgmt-backend/assets/data/tripadvisor.html", totalData, function (err) {
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




