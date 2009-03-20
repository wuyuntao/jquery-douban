var url = 'http://jquery-douban.appspot.com/test/handler/';
var params = { 'p1': 'parameter_one', 'p2': 'parameter_two' };
var headers = { 'h1': 'header_one', 'h2': 'header_two' };
var data = '<?xml version="1.0" encoding="UTF-8"?><entry></entry>';

Douban.handler.gears.GET(url, params, headers, testJson);
Douban.handler.gears.POST(url, params, data, headers, testJson);
Douban.handler.gears.PUT(url, params, data, headers, testJson);
Douban.handler.gears.DELETE(url, params, headers, testText);

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
    fireunit.compare('{"url": "http:\\/\\/jquery-douban.appspot.com\\/test\\/handler\\/?p1=parameter_one&p2=parameter_two", "headers": {"h2": "header_two", "h1": "header_one"}, "params": {"p2": "parameter_two", "p1": "parameter_one"}, "data": ""}', text, "Text");
}
