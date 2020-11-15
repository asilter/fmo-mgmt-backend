let htmlparser = require("htmlparser2");
let rawHtml = "<html><head><title>baslik</title></head><body>your html string</body></html>";
let handler = new htmlparser.DomHandler(function (error, dom) {
    console.log("DOM Handler");
    console.log(dom);
    //for(var child in dom.element.children) {
    //    console.log(child);
    //}
});
let parser = new htmlparser.Parser(handler);
parser.write(rawHtml);
parser.done();