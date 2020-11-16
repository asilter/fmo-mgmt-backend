// CommonJS
var parse = require('html-dom-parser');
var htmlclean = require('htmlclean');
const fs = require('fs');

fs.readFile('./assets/data/tripadvisor-oa30.html', 'utf8', function (err, html) {
    if (err) {
        console.log(err);
    } else {
        html = htmlclean(html);
        html = html.replace(/[\t\n\r]/gm, "");
        html = html.substring(html.indexOf("EATERY_SEARCH_RESULTS") - 9);
        let dom = parse(html);
        let list_item;
        for (var i = 0; i < dom[0].children[1].children[0].children.length; i++) {
            list_item = dom[0].children[1].children[0].children[i];
            if (list_item.attribs['data-test']) {
                console.log(list_item.attribs['data-test'] + "\t|\t" + list_item.children[0].children[0].children[0].children[0].children[0].attribs['href']);
            }
        }
    }
});






