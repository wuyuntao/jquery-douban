// {{{ Basic Testcases
module("Basic Testcases");

test("test factory method", function() {
    var service = $.douban({ apiKey: '1', apiSecret: '2' });
    ok(service, "initialize douban service ok");
    equals(service.api.key, '1', "api key expected to be 1");
    equals(service.api.secret, '2', "api secret expected to be 2");
    equals(service.options.httpType, 'jquery', "http type expected to be \"jquery\"");

    var service2 = $.douban({ apiKey: '3', apiSecret: '4', httpType: 'gears' });
    ok(service2, "initialize douban service ok");
    equals(service2.api.key, '3', "api key expected to be 3");
    equals(service2.api.secret, '4', "api secret expected to be 4");
    equals(service2.options.httpType, 'gears', "http type expected to be \"gears\"");

    var client = $.douban('client', { apiKey: '5', apiSecret: '6' });
    ok(client, "initialize douban client ok");
    equals(client.api.key, '5', "api key expected to be 5");
    equals(client.api.secret, '6', "api secret expected to be 6");
    equals(client.options.httpType, 'jquery', "http type expected to be \"jquery\"");
});
// }}}

// {{{ HTTP Testcases
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
// }}}

// {{{ OAuth Client Testcases
module("OAuth Client Testcases");

test("test factory method", function() {
    var client = $.douban.client.factory({ apiKey: '1', apiSecret: '2' });
    equals(client.api.key, '1', "api key expected to be 1");
    equals(client.api.secret, '2', "api secret expected to be 2");
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

test("test authorization step 3: get access token ", function() {
    netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");

    var client = $.douban.client.factory({ apiKey: '0107c5c3c9d4ecc40317514b5d7ec64c', apiSecret: '7feaf4ec7b6989f8' });
    client.requestToken = { key: '6af14a5ae303c71f40d3df10a90b555d',
                            secret: '7f25d398fc683123' };
    var accessToken = client.getAccessToken();
    // When the client is authenticated, the request token will be invalid
    equals(accessToken.key, '6fcf833aff0589884f6e89b0fd109c98', "get access key");
    equals(accessToken.secret, 'b693646c5d1929ab', "get access secret");
    equals(client.userId, 'wyt', "get username");
});

test("test programmatic login", function() {
    var client = $.douban.client.factory({ apiKey: '1', apiSecret: '2' });
    var accessToken = { key: '6fcf833aff0589884f6e89b0fd109c98', secret: 'b693646c5d1929ab' };
    var login = client.login(accessToken);
    ok(login, "login successful");
    ok(client.isAuthenticated(), "access is authenticated");
});
// }}}

// {{{ Douban Service Testcases
module("Douban Service Testcases");

test("test factory method", function() {
    var service = $.douban.service.factory({ apiKey: '1', apiSecret: '2' });
    equals(service.api.key, '1', "api key expected to be 1");
    equals(service.api.secret, '2', "api secret expected to be 2");
    equals(service.http.name, 'jquery', "http type expected to be \"jquery\"");
    ok(service.client, "client initialized");
});

test("test client login", function() {
    netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");

    var service = $.douban.service.factory({ apiKey: '0107c5c3c9d4ecc40317514b5d7ec64c', apiSecret: '7feaf4ec7b6989f8' });
    var accessToken = { key: '6fcf833aff0589884f6e89b0fd109c98', secret: 'b693646c5d1929ab' };
    var login = service.login(accessToken);
    ok(login, "login successful");
});

test("test user api", function() {
    netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");

    var service = $.douban.service.factory({ apiKey: '0107c5c3c9d4ecc40317514b5d7ec64c', apiSecret: '7feaf4ec7b6989f8' });
    service.login({ key: '6fcf833aff0589884f6e89b0fd109c98', secret: 'b693646c5d1929ab' });

    // get user profile
    var user = service.user.get('ahbei');
    equals(user.name, '阿北', "get user name ok");

    // search people
    var result = service.user.search('keso');
    equals(result.length, 50, "search people ok");

    // get current authenticated user
    var me = service.user.current();
    equals(me.name, 'wu yuntao', "get my name ok");

    // get user's friends
    var friends = service.user.friend('ahbei');
    equals(result.length, 50, "get user's friends ok");

    // get user's contacts
    var contacts = service.user.contact('ahbei');
    equals(contacts.length, 50, "get user's contacts ok");
});
// }}}
