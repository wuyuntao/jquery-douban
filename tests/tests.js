
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
    var request = $.douban.http.factory();
    equals(request.name, 'jquery', "initialize gears http request handler ok");
    ok(request.get, "GET method ok");

    var request2 = $.douban.http.factory({ type: 'greasemonkey' });
    equals(request2.name, 'greasemonkey', "initialize gears http request handler ok");
    ok(request2.post, "POST method ok");
});

test("test jquery http methods", function() {
    // Privileges are granted only in the scope of the requesting function.
    netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");

    var request = $.douban.http.factory({ type: 'jquery' });
    var response = null;
    request.get('http://api.douban.com/book/subject/2023013?alt=json', {},
                function(json) { response = json; });
    ok(response, 'get response ok');
});

module("OAuth Client Testcases");

test("test factory method", function() {
    var client = $.douban.client.factory({ apiKey: '1', apiSecret: '2' });
    equals(client.apiKey, '1', "api key expected to be 1");
    equals(client.apiSecret, '2', "api secret expected to be 2");
    equals(client.http.name, 'jquery', "http type expected to be \"jquery\"");
});

test("test authorization step 1: get request token", function() {
    netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");

    var client = $.douban.client.factory({ apiKey: '0107c5c3c9d4ecc40317514b5d7ec64c', apiSecret: '7feaf4ec7b6989f8' });
    var requestToken = client.getRequestToken();
    equals(requestToken.key.length, 32, "check the length of request key ( \"" + requestToken.key + "\" )");
    equals(requestToken.secret.length, 16, "check the length of request secret ( \"" + requestToken.secret + "\" )");
});

test("test authorization step 2: get authorization url", function() {
    var client = $.douban.client.factory({ apiKey: '1', apiSecret: '2' });
    var callback = 'mycallback';
    // Set request token manually
    client.requestToken = { key: '3', secret: '4' };

    var url = client.getAuthorizationUrl(callback);
    equals(url, 'http://www.douban.com/service/auth/authorize?oauth_token=3&oauth_callback=mycallback');

    var url2 = client.getAuthorizationUrl({ key: '5', secret: '6' }, callback);
    equals(url2, 'http://www.douban.com/service/auth/authorize?oauth_token=5&oauth_callback=mycallback');
});

test("test authorization steps 3 & 4", function() {
    netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");

    // var accessToken = client.getAccessToken(requestToken);
    // equals(accessToken.key, '5', "get access key");
    // equals(accessToken.secret, '6', "get access secret");

    // var login = client.login(accessToken);
    // ok(login, "access is authenticated");
    // ok(client.isAuthenticated(), "access is authenticated");
});

test("test programmatic login", function() {
    // Privileges are granted only in the scope of the requesting function.
    // netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");

    var client = $.douban.client.factory({ apiKey: '1', apiSecret: '2' });
    // TODO ...
});
