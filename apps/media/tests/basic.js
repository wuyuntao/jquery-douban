module("Basic Testcases");

test("test factory method", function() {
    var service = $.douban({ key: '1', secret: '2' });
    ok(service, "initialize douban service ok");
    equals(service.api.key, '1', "api key expected to be 1");
    equals(service.api.secret, '2', "api secret expected to be 2");
    equals(service._http.name, 'jquery', "http type expected to be \"jquery\"");

    var client = $.douban('client', { key: '5', secret: '6' });
    ok(client, "initialize douban client ok");
    equals(client.api.key, '5', "api key expected to be 5");
    equals(client.api.secret, '6', "api secret expected to be 6");
    equals(client.options.type, 'jquery', "http type expected to be \"jquery\"");
});

module("HTTP Testcases");

test("test factory method", function() {
    function AirHandler(options) { return; }
    AirHandler.name = 'air';

    equals($.douban.http.activeHandler.name, 'jquery', "default handler is 'jquyer'");
    $.douban.http.register('air', AirHandler);
    $.douban.http.setActive('air');
    equals($.douban.http.activeHandler.name, 'air', "set handler to 'air' ok");

    var request = $.douban.http.factory();
    equals(request.name, 'jquery', "initialize jquery http request handler ok");

    var request2 = $.douban.http.factory({ type: 'air' });
    equals(request2.name, 'air', "initialize air http request handler ok");

    $.douban.http.setActive('jquery');
});

test("test jquery http methods", function() {
    // Privileges are granted only in the scope of the requesting function.
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");

    var response = null;
    var request = $.douban.http({ async: false,
                                  url: 'http://api.douban.com/book/subject/2023013?alt=json',
                                  success: function(json) { response = json } });
    ok(response, 'get response ok');

    var reponse2 = null;
    var request2 = $.douban.http.factory();
    var response2 = request2({ async: false,
                               url: 'http://api.douban.com/book/subject/2023013?alt=json',
                               success: function(json) { response = json } });
    ok(response2, 'get response ok');
});

module("Douban Service Testcases");

test("test factory method", function() {
    var service = $.douban('service', { key: '1', secret: '2' });
    equals(service.api.key, '1', "api key expected to be 1");
    equals(service.api.secret, '2', "api secret expected to be 2");
    equals(service._http.name, 'jquery', "http type expected to be \"jquery\"");
    ok(service._client, "client initialized");
});

test("test client login", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");

    var service = $.douban({ key: '0107c5c3c9d4ecc40317514b5d7ec64c', secret: '7feaf4ec7b6989f8' });
    var accessToken = { key: '6fcf833aff0583884f6e89b0fd109c98', secret: 'b623646c5d1929ab' };
    var login = service.login(accessToken);
    ok(login, "login successful");
});
