// CommonJS
var parse = require('html-dom-parser');
var htmlclean = require('htmlclean');
var decodeHtml = require('decode-html');
const fs = require('fs');

fs.readFile('./assets/data/a-restaurant2.html', 'utf8', function (err, html) {
    if (err) {
        console.log(err);
    } else {

        let name;
        let address;
        let email;
        let phone;

        html = htmlclean(html);
        html = html.replace(/[\t\n\r]/gm, "");

        html = html.substring(html.indexOf("taplc_top_info_0") - 9);
        let dom = parse(html);
        name = dom[0].children[0].children[0].children[0].children[0].children[0].data
        name = decodeHtml(name);
        console.log("Name\t:\t" + name);

        html = html.substring(html.indexOf("xAOpeG9l") - 12);
        dom = parse(html);
        address = dom[0].children[0].next.next.children[0].next.children[0].children[0].children[0].data;
        address = decodeHtml(address);
        console.log("Address\t:\t" + address);

        if (dom[0].children[0].next.next.next.next.prev.children[1].children.length == 0) {
            email = "N/A";
        } else {
            email = dom[0].children[0].next.next.next.next.prev.children[1].children[0].children[0].attribs['href'];
            email = email.substring(email.indexOf("mailto:") + 7);
            email = email.substring(0, email.indexOf("?"));
        }
        console.log("E-Mail\t:\t" + email);

        phone = dom[0].children[0].next.next.next.next.prev.next.children[0].children[0].children[0].children[0].next.children[0].data;
        console.log("Phone\t:\t" + phone);
        


    }
});






