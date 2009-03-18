netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");

var url = 'http://localhost:8080/test/handler/';
var params = { 'p1': 'parameter_one', 'p2': 'parameter_two' };
var headers = { 'h1': 'header_one', 'h2': 'header_two' };
var data = '<?xml version="1.0" encoding="UTF-8"?><entry></entry>';

Douban.handler.jquery.GET(url, params, headers, testJson);
Douban.handler.jquery.POST(url, params, data, headers, testJson);
Douban.handler.jquery.PUT(url, params, data, headers, testJson);
Douban.handler.jquery.DELETE(url, params, headers, testText);

function testJson(json) {
    console.debug(json);
    fireunit.compare(url + '?' + $.param(params), json.url, "URL");
    fireunit.compare(params.p1, json.params.p1, "Params");
    fireunit.compare(params.p2, json.params.p2, "Params");
    fireunit.compare(headers.h1, json.headers.h1, "Headers");
    fireunit.compare(headers.h2, json.headers.h2, "Headers");
    if (json.data) fireunit.compare(data, json.data, "Data");
}

function testText(text) {
    console.debug(text);
    fireunit.compare('{"url": "http:\\/\\/localhost:8080\\/test\\/handler\\/", "headers": {"h2": "header_two", "h1": "header_one"}, "params": {}, "data": "p1=parameter_one&p2=parameter_two"}', text, "Text");
}
