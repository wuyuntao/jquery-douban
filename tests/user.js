module("Douban User Testcases");

test("test user api", function() {
    expect(21);

    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    // get user profile
    var ahbei = service.user.get('ahbei');
    equals(ahbei.id, "http://api.douban.com/people/1000001", "get user id ok");
    equals(ahbei.userName, "ahbei", "get user name ok");
    equals(ahbei.screenName, "阿北", "get screen name ok");
    equals(ahbei.location, "北京", "get location ok");
    equals(ahbei.blog, "http://ahbei.com/", "get blog ok");
    equals(ahbei.intro, "豆瓣的临时总管。现在多数时间在忙忙碌碌地为豆瓣添砖加瓦。坐在马桶上看书，算是一天中最放松的时间。\r\n\r\n我不但喜欢读书、旅行和音乐电影，还曾经是一个乐此不疲的实践者，有一墙碟、两墙书、三大洲的车船票为记。现在自己游荡差不多够了，开始懂得分享和回馈。豆瓣是一个开始，希望它对你同样有用。\r\n\r\n(我的朋友邀请原则：一般是线下朋友，见过不只一次面。谢谢“关注” )。\r\n", "get introduction ok");
    equals(ahbei.url, "http://www.douban.com/people/ahbei/", "get user url ok");
    equals(ahbei.imageUrl, "http://otho.douban.com/icon/u1000001-14.jpg", "get user icon url ok");

    // get user's friends
    var friends = service.user.friends('wyt', 7, 4);
    ok(friends.total > 72, "get user's total friends ok");
    equals(friends.entries.length, 4, "get user's friends ok");

    // get user's contacts
    var contacts = service.user.contacts('wyt', 2, 5);
    ok(contacts.total > 111);
    equals(contacts.entries.length, 5, "get user's contacts ok");

    // get current authenticated user
    var me = service.user.current();
    equals(me.id, "http://api.douban.com/people/2133418", "get current user name ok");
    equals(me.userName, "iloveshutuo", "get current user id ok");

    // search people
    var result = service.user.search('ke', 6, 3);
    ok(result.total, "okay: search people total results is" + result.total);
    equals(result.offset, 6, "search people start index ok");
    equals(result.limit, 3, "search people max results ok");
    equals(result.entries.length, 3, "search people ok");
    equals(result.entries[0].id, "http://api.douban.com/people/1110946", "get user id ok");
    equals(result.entries[1].id, "http://api.douban.com/people/1652131", "get user id ok");
    equals(result.entries[2].id, "http://api.douban.com/people/1280023", "get user id ok");
});

test("test user object", function() {
    expect(15);

    var json = {"content":{"$t":""},"db:uid":{"$t":"whoami"},"link":[{"@rel":"self","@href":"http://api.douban.com/people/2139418"},{"@rel":"alternate","@href":"http://www.douban.com/people/whoami/"},{"@rel":"icon","@href":"http://otho.douban.com/icon/u2139418-1.jpg"}],"id":{"$t":"http://api.douban.com/people/2139418"},"title":{"$t":"我是谁"}};
    var user = $.douban('user', json);
    equals(user.id, "http://api.douban.com/people/2139418", "get user id ok");
    equals(user.userName, "whoami", "get user name ok");
    equals(user.screenName, "我是谁", "get screen name ok");
    equals(user.location, undefined, "get user location ok");
    equals(user.blog, undefined, "get user blog ok");
    equals(user.intro, '', "get user introduction ok");
    equals(user.url, "http://www.douban.com/people/whoami/", "get user homepage ok");
    equals(user.imageUrl, "http://otho.douban.com/icon/u2139418-1.jpg", "get user icon url ok");

    var user2 = $.douban('user');
    equals(user2.id, undefined);
    equals(user2.userName, undefined);
    equals(user2.location, undefined);
    equals(user2.blog, undefined);
    equals(user2.intro, undefined);
    equals(user2.url, undefined);
    equals(user2.imageUrl, undefined);
});

// vim: foldmethod=indent
