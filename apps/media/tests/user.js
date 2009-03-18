module("Douban User Testcases");

test("test get user profile", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    stop();
    service.user.get('ahbei', function(ahbei) {
        console.debug("ahbei: ", ahbei);
        equals(ahbei.id, "http://api.douban.com/people/1000001", "get user id ok");
        equals(ahbei.uid, "ahbei", "get user name ok");
        equals(ahbei.name, "阿北", "get screen name ok");
        equals(ahbei.location, "北京", "get location ok");
        equals(ahbei.link.blog, "http://ahbei.com/", "get blog ok");
        equals(ahbei.intro, "豆瓣的临时总管。现在多数时间在忙忙碌碌地为豆瓣添砖加瓦。坐在马桶上看书，算是一天中最放松的时间。\r\n\r\n我不但喜欢读书、旅行和音乐电影，还曾经是一个乐此不疲的实践者，有一墙碟、两墙书、三大洲的车船票为记。现在自己游荡差不多够了，开始懂得分享和回馈。豆瓣是一个开始，希望它对你同样有用。\r\n\r\n(我的朋友邀请原则：一般是线下朋友，见过不只一次面。谢谢“关注” )。\r\n", "get introduction ok");
        equals(ahbei.link.home, "http://www.douban.com/people/ahbei/", "get user url ok");
        equals(ahbei.link.image, "http://otho.douban.com/icon/u1000001-14.jpg", "get user icon url ok");
        start();
    });
});

test("test get user friends", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    stop();
    service.user.friends('wyt', 7, 4, function(friends) {
        console.debug("friends: ", friends);
        ok(friends.total > 72, "get user's total friends ok");
        equals(friends.entry.length, 4, "get user's friends ok");
        start();
    });
});

test("test get user contacts", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    stop();
    service.user.contacts('wyt', 2, 5, function(contacts) {
        console.debug("contacts: ", contacts);
        ok(contacts.total > 111);
        equals(contacts.entry.length, 5, "get user's contacts ok");
        start();
    });
});

test("test get current authenticated user", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    stop();
    service.user.current(function(me) {
        console.debug("me: ", me);
        equals(me.id, "http://api.douban.com/people/2133418", "get current user name ok");
        equals(me.uid, "iloveshutuo", "get current user id ok");
        start();
    });
});

test("test search people", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();
    var re = /^http:\/\/api\.douban\.com\/people\/\d+$/;

    stop();
    service.user.search('ke', 2, 3, function(result) {
        console.debug("search results: ", result);
        ok(result.total, "okay: search people total results is " + result.total);
        equals(result.offset, 2, "search people start index ok");
        equals(result.limit, 3, "search people max results ok");
        equals(result.entry.length, 3, "search people ok");
        ok(result.entry[0].id.match(re), "get user id ok");
        ok(result.entry[1].id.match(re), "get user id ok");
        ok(result.entry[2].id.match(re), "get user id ok");
        start();
    });
});
