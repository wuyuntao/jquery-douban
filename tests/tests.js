module("Basic Testcases");

test("test factory method", function() {
    var service = $.douban({ apiKey: '1', apiSecret: '2' });
    ok(service, "initialize douban service ok");
    equals(service.apiKey, '1', "api key expected to be 1");
    equals(service.apiSecret, '2', "api secret expected to be 2");
    equals(service.options.httpType, 'jquery', "http type expected to be \"jquery\"");

    var service2 = $.douban({ apiKey: '3', apiSecret: '4', httpType: 'gears' });
    ok(service2, "initialize douban service ok");
    equals(service2.apiKey, '3', "api key expected to be 3");
    equals(service2.apiSecret, '4', "api secret expected to be 4");
    equals(service2.options.httpType, 'gears', "http type expected to be \"gears\"");
});

module("HTTP Testcases");

test("test factory method", function() {
});


