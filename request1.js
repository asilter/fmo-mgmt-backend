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
const req;

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


        let base_uri = "https://www.tripadvisor.com/Restaurants-g186338-London_England.html";
        let address_and_path = "";
        let _hostname;
        let _path;
        let _port;
        let _path_prefix_before_path_code;
        let _path_code;
        let _path_suffix_after_path_code;
        let bPortExists = false;

        if (base_uri.indexOf("http://") > -1) {
            address_and_path = base_uri.substring(base_uri.indexOf("http://") + 7);
        } else if (base_uri.indexOf("https://") > -1) {
            address_and_path = base_uri.substring(base_uri.indexOf("https://") + 8);
        }
        if (address_and_path.indexOf(":") > -1) {
            // port var
            bPortExists = true;
            _port = address_and_path.substring(address_and_path.indexOf(":") + 1, address_and_path.indexOf("/"));
        }

        if (bPortExists) {
            _hostname = address_and_path.substring(0, address_and_path.indexOf(":"));
        } else {
            _hostname = address_and_path.substring(0, address_and_path.indexOf("/"));
        }

        _path = address_and_path.substring(address_and_path.indexOf("/"));

        _path_code = _path.substring(_path.indexOf("/Restaurants-")+13).substring(0,7);
        _path_prefix_before_path_code = _path.substring(0,_path.indexOf(_path_code));
        _path_suffix_after_path_code = _path.substring(_path.indexOf(_path_code)+7);
        
        console.log("address_and_path:" + address_and_path);
        console.log("_hostname:" + _hostname);
        console.log("_path:" + _path);
        console.log("_port:" + _port);
        console.log("_path_prefix_before_path_code:" + _path_prefix_before_path_code);
        console.log("_path_code:" + _path_code);
        console.log("_path_suffix_after_path_code:" + _path_suffix_after_path_code);
        
    })
});


req.on('error', error => {
    console.log("Failed!");
    console.error(error);
});



req.end();




