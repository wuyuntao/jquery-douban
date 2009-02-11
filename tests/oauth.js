module("OAuth Client Testcases");

test("test factory method", function() {
    var client = $.douban('client', { key: '1', secret: '2' });
    equals(client.api.key, '1', "api key expected to be 1");
    equals(client.api.secret, '2', "api secret expected to be 2");
    equals(client._http.name, 'jquery', "http type expected to be \"jquery\"");
});

test("test authorization step 1: get request token synchronously", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");

    var client = $.douban('client', {
        key: '0107c5c3c9d4ecc40317514b5d7ec64c',
        secret: '7feaf4ec7b6989f8'
    });

    var requestToken = client.getRequestToken();
    equals(requestToken.key.length, 32, "check the length of request key ( \"" + requestToken.key + "\" )");
    equals(requestToken.secret.length, 16, "check the length of request secret ( \"" + requestToken.secret + "\" )");
    
    // Print authorization URL
    // console.debug(client.getAuthorizationUrl(requestToken));
});

test("test authorization step 1: get request token asynchronously", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");

    var client = $.douban('client', {
        key: '0107c5c3c9d4ecc40317514b5d7ec64c',
        secret: '7feaf4ec7b6989f8',
        async: true
    });

    stop();
    client.getRequestToken(function(token) {
        equals(token.key.length, 32, "check the length of request key ( \"" + token.key + "\" )");
        equals(token.secret.length, 16, "check the length of request secret ( \"" + token.secret + "\" )");
        start();
    });
});

test("test authorization step 2: get authorization url", function() {
    var client = $.douban('client', { key: '1', secret: '2' });
    var callback = 'mycallback';
    // Set request token manually
    client.requestToken = { key: '3', secret: '4' };

    var url = client.getAuthorizationUrl(callback);
    equals(url, 'http://www.douban.com/service/auth/authorize?oauth_token=3&oauth_callback=mycallback');

    var url2 = client.getAuthorizationUrl({ key: '5', secret: '6' });
    equals(url2, 'http://www.douban.com/service/auth/authorize?oauth_token=5&oauth_callback=');
});

test("test authorization step 3: get access token synchronously", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");

    var client = $.douban('client', {
        key: '0107c5c3c9d4ecc40317514b5d7ec64c',
        secret: '7feaf4ec7b6989f8'
    });
    requestToken = { key: '', secret: '' };

    if (requestToken.key) {
        var accessToken = client.getAccessToken(requestToken);
        // When the client is authenticated, the request token will be invalid
        equals(accessToken.key.length, 32, "check the length of access key ( \"" + accessToken.key + "\" )");
        equals(accessToken.secret.length, 16, "check the length of access secret ( \"" + accessToken.secret + "\" )");
        equals(client.userId, '1139389', "get username");
    }
});

test("test authorization step 3: get access token asynchronously", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");

    var client = $.douban('client', {
        key: '0107c5c3c9d4ecc40317514b5d7ec64c',
        secret: '7feaf4ec7b6989f8',
        async: true
    });
    requestToken = { key: '', secret: '' };

    if (requestToken.key) {
        stop();
        client.getAccessToken(requestToken, function(token, userId) {
            // When the client is authenticated, the request token will be invalid
            equals(token.key.length, 32, "check the length of access key ( \"" + token.key + "\" )");
            equals(token.secret.length, 16, "check the length of access secret ( \"" + token.secret + "\" )");
            equals(client.userId, '1139389', "get username");
            start();
        });
    }
});

test("test programmatic login", function() {
    var client = $.douban('client', { key: '1', secret: '2' });
    var accessToken = { key: '6fcf833aff0589883f6e89b0fd109c98', secret: 'b692646c5d1929ab' };
    var login = client.login(accessToken);
    ok(login, "login successful");
    ok(client.isAuthenticated(), "access is authenticated");
});

test("test auth headers", function() {
    var client = $.douban('client', { key: '1', secret: '2' });
    var headers = client.getAuthHeaders('http://api.douban.com/people/1000001', 'GET', { 'alt': 'json' });
    ok(headers, "get headers ( \"" + headers + "\" )");
});

// vim: foldmethod=indent
