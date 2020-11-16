var DomParser = require('dom-parser');
const fs = require('fs');
var parser = new DomParser();

//fs.readFile('./assets/data/a_restaurant.html', 'utf8', function (err, html) {
fs.readFile('./assets/data/basic.html', 'utf8', function (err, html) {
    if (err) {
        console.log(err);
    } else {
        var dom = parser.parseFromString(html);
        //console.log(dom);
        //console.log(dom.getElementsByTagName("a"));
        console.log(dom);
        //for( let a in dom.getElementsByTagName("a")) {
        //    console.log(a);
        //}
        //console.log(dom.getElementsByAttribute("href"));
        //console.log(dom.getElementsByTagName("32_list_item"));
        //console.log(dom.getElementById('myElement').innerHTML);
    }

})