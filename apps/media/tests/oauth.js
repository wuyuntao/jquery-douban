module("OAuth Client Testcases");

test("test factory method", function() {
    var client = new Client({
        key: '1', secret: '2',
        request: Douban.handler.jquery
    });
    equals(client.api.key, '1', "api key expected to be 1");
    equals(client.api.secret, '2', "api secret expected to be 2");
    equals(client.request.name, 'jquery', "http type expected to be \"jquery\"");
});

test("test authorization step 1: get request token", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");

    var client = new Client({
        key: '0107c5c3c9d4ecc40317514b5d7ec64c',
        secret: '7feaf4ec7b6989f8'
    });

    stop();
    client.requestToken(function(token) {
        equals(token.key.length, 32,
               "check the length of request key ( \"" + token.key + "\" )");
        equals(token.secret.length, 16,
               "check the length of request secret ( \"" + token.secret + "\" )");
        ok(client.authorizationUrl(token), client.authorizationUrl(token));
        start();
    });
});

test("test authorization step 2: get authorization url", function() {
    var client = new Client({ key: '1', secret: '2' });
    var callback = 'mycallback';
    var url = client.authorizationUrl({ key: '3', secret: '4' }, callback);
    equals(url, 'http://www.douban.com/service/auth/authorize?oauth_token=3&oauth_callback=mycallback');
});

test("test authorization step 3: get access token", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");

    var client = new Client({
        key: '0107c5c3c9d4ecc40317514b5d7ec64c',
        secret: '7feaf4ec7b6989f8'
    });
    requestToken = {
        key: '40124b62c57031c6c036e22850509552',
        secret: '4fb86fde66ae75c0'
    };

    /*
    stop();
    client.accessToken(requestToken, function(token, uid) {
        // When the client is authenticated, the request token will be invalid
        equals(token.key.length, 32,
               "check the length of access key ( \"" + token.key + "\" )");
        equals(token.secret.length, 16,
               "check the length of access secret ( \"" + token.secret + "\" )");
        equals(uid, '2133418', "get username");
        start();
    });
    */
});

test("test programmatic login", function() {
    var client = new Client({
        key: '0107c5c3c9d4ecc40317514b5d7ec64c',
        secret: '7feaf4ec7b6989f8'
    });
    var accessToken = {
        key: '2e2fa5e45bee84308a8ef1ad13cb8c90',
        secret: 'fe5e5256ee3128a1'
    };
    var login = client.login(accessToken);
    ok(login, "login successful");
});
