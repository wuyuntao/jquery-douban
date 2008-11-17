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
    equals($.douban.http.activeHandler.name, 'jquery', "default handler is 'jquyer'");
    $.douban.http.setActive('gears');
    equals($.douban.http.activeHandler.name, 'gears', "set handler to 'geas' ok");

    var request = $.douban.http.factory();
    equals(request.name, 'jquery', "initialize jquery http request handler ok");

    var request2 = $.douban.http.factory({ type: 'greasemonkey' });
    equals(request2.name, 'greasemonkey', "initialize greasemonkey http request handler ok");

    $.douban.http.setActive('jquery');
});

test("test jquery http methods", function() {
    // Privileges are granted only in the scope of the requesting function.
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

test("test auth headers", function() {
    var client = $.douban.client.factory({ apiKey: '1', apiSecret: '2' });
    var headers = client.getAuthHeaders('http://api.douban.com/people/1000001', 'GET', { 'alt': 'json' });
    ok(headers, "get headers ( \"" + headers + "\" )");
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

test("test user class", function() {
    var json = {"content":{"$t":""},"db:uid":{"$t":"whoami"},"link":[{"@rel":"self","@href":"http://api.douban.com/people/2139418"},{"@rel":"alternate","@href":"http://www.douban.com/people/whoami/"},{"@rel":"icon","@href":"http://otho.douban.com/icon/u2139418-1.jpg"}],"id":{"$t":"http://api.douban.com/people/2139418"},"title":{"$t":"我是谁"}};
    var user = $.douban.user.factory(json);
    equals(user.id, "http://api.douban.com/people/2139418", "get user id ok");
    equals(user.userName, "whoami", "get user name ok");
    equals(user.screenName, "我是谁", "get screen name ok");
    equals(user.location, "", "get user location ok");
    equals(user.blog, "", "get user blog ok");
    equals(user.intro, "", "get user introduction ok");
    equals(user.url, "http://www.douban.com/people/whoami/", "get user homepage ok");
    equals(user.iconUrl, "http://otho.douban.com/icon/u2139418-1.jpg", "get user icon url ok");
});

test("test user api", function() {
    netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");

    var service = $.douban.service.factory({ apiKey: '0107c5c3c9d4ecc40317514b5d7ec64c', apiSecret: '7feaf4ec7b6989f8' });
    service.login({ key: '6fcf833aff0589884f6e89b0fd109c98', secret: 'b693646c5d1929ab' });

    // get user profile
    var ahbei = service.user.get('ahbei');
    equals(ahbei.id, "http://api.douban.com/people/1000001", "get user id ok");
    equals(ahbei.userName, "ahbei", "get user name ok");
    equals(ahbei.screenName, "阿北", "get screen name ok");
    equals(ahbei.location, "北京", "get location ok");
    equals(ahbei.blog, "http://ahbei.com/", "get blog ok");
    equals(ahbei.intro, "豆瓣的临时总管。现在多数时间在忙忙碌碌地为豆瓣添砖加瓦。坐在马桶上看书，算是一天中最放松的时间。\r\n\r\n我不但喜欢读书、旅行和音乐电影，还曾经是一个乐此不疲的实践者，有一墙碟、两墙书、三大洲的车船票为记。现在自己游荡差不多够了，开始懂得分享和回馈。豆瓣是一个开始，希望它对你同样有用。\r\n\r\n(我的朋友邀请原则：一般是线下朋友，见过不只一次面。谢谢“关注” )。\r\n", "get introduction ok");
    equals(ahbei.url, "http://www.douban.com/people/ahbei/", "get user url ok");
    equals(ahbei.iconUrl, "http://otho.douban.com/icon/u1000001-14.jpg", "get user icon url ok");

    // search people
    var result = service.user.search('ke', 6, 3);
    equals(result.total, 48, "search people total results ok");
    equals(result.offset, 6, "search people start index ok");
    equals(result.limit, 3, "search people max results ok");
    equals(result.entries.length, 3, "search people ok");
    equals(result.entries[0].id, "http://api.douban.com/people/1282010", "get user id ok");
    equals(result.entries[1].id, "http://api.douban.com/people/1110946", "get user id ok");
    equals(result.entries[2].id, "http://api.douban.com/people/1652131", "get user id ok");

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

test("test misc", function() {
});
// }}}
