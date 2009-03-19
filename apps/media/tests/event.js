module("豆瓣活动 API 测试");

test("测试获取活动", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();
    stop();
    service.event.get('10288075', function(evento) {
        console.debug(evento);
        equals(evento.id, 'http://api.douban.com/event/10288075');
        equals(evento.title, '蜷川実花个展  ');
        start();
    });
});

test("测试获取参加活动的用户", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    stop();
    service.event.participants('10288075', 0, 3, function(participants) {
        console.debug(participants);
        ok(participants.total > 0,
           "获取参加活动的用户 okay: " + participants.total);
        ok(participants.entry[0].id.match(/\/people\/\d+$/),
           "获取参加活动的用户ID okay: " + participants.entry[0].id);
        ok(participants.entry[0].name.length > 0,
           "获取参加活动的用户名 okay: " + participants.entry[0].name);
        equals(participants.title, "要参加 蜷川実花个展   活动的成员");
        start();
    });
});

test("测试获取活动感兴趣的用户", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    stop();
    service.event.wishers('10288075', 10, 3, function(wishers) {
        console.debug(wishers);
        ok(wishers.total > 0, "获取活动感兴趣的用户 okay: " + wishers.total);
        equals(wishers.offset, 10, "获取活动感兴趣的用户 offset okay");
        equals(wishers.limit, 3, "获取活动感兴趣的用户 offset okay");
        equals(wishers.title, "对 蜷川実花个展   活动感兴趣的成员");
        start();
    });
});

test("测试获取用户的所有活动", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    stop();
    service.event.getForUser('NullPointer', 1, 2, function(events) {
        console.debug(events);
        ok(events.total > 0, "get total okay: " + events.total);
        equals(events.limit, 2, "get limit okay: " + events.limit);
        ok(events.entry[0].id.match(/http:\/\/api\.douban\.com\/event\/\d+/),
           "get id okay: " + events.entry[0].id);
        equals(events.title, "NullPointer的活动");
        start();
    });
});

test("测试获取用户发起 / 参加 / 感兴趣的所有活动", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    stop();
    service.event.getInitiateForUser('cookiebox', 1, 4, function(events) {
        console.debug(events);
        ok(events.total == 0,
           "豆瓣不输出用户发起的活动总数 okay: " + events.total);
        ok(events.offset > 0,
           "获取用户发起的所有活动 offset okay: " + events.offset);
        ok(events.entry.length > 0,
           "获取用户发起的所有活动 okay: " + events.entry.length);
        equals(events.title, "啞孩子发起的活动");
        start();
    });
});

test("测试获取城市的所有活动", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    stop();
    var events = service.event.getForCity('shanghai', 0, 10, function(events) {
        console.debug(events);
        ok(events.total > 1, "获取城市的所有活动 okay: " + events.total);
        equals(events.title, "豆瓣同城 上海 的 戏剧/曲艺 活动");
        start();
    }, { type: 'drama' });
});

test("测试搜索活动", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    stop();
    service.event.search("蛋糕", 'shanghai', 5, 8, function(events) {
        console.debug(events);
        ok(events.total > 1, "search events: " + events.total);
        equals(events.title, "豆瓣同城上海活动搜索 蛋糕 的结果");
        start();
    });
});

test("测试创建新活动", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    stop();
    service.event.add({
        category: 'film',
        title: '测试添加活动',
        content: '测试添加活动内容',
        isInviteOnly: true,
        isInviteEnabled: false,
        startTime: new Date(2009, 3, 22, 20),
        endTime: new Date(2009, 3, 30, 9),
        address: '测试添加活动地址' }, function(evento) {
        console.debug(evento);
        ok(evento2.id.match(/http:\/\/api\.douban\.com\/event\/\d+/), "get event id ok: " + evento2.id);
        start();
    });
});

/*
test("测试更新活动", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    stop();
    var evento3 = service.event.update(evento2, {
        category: 'film',
        title: '测试更新活动',
        content: '测试更新活动内容',
        isInviteOnly: true,
        isInviteEnabled: false,
        startTime: new Date(2009, 1, 12, 20),
        endTime: new Date(2009, 2, 30, 9),
        address: '测试更新活动地址'
    });
    equals(evento3.title, '测试更新活动');
    equals(evento3.address, '武汉 测试更新活动地址');
        start();
    });
});

test("测试删除活动", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    stop();
    var response = service.event.remove(evento2);
    ok(response, 'event removed');
        start();
    });
});
*/

/*
test("测试参加活动", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    stop();
    service.event.participate('10561673', function(response) {
        ok(response, "要参加活动");
        start();
    });
});

test("测试不参加活动了", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    stop();
    service.event.notParticipate('10561673', function(response) {
        ok(response, "不参加活动了");
        start();
    });
});

test("测试对活动感兴趣", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    stop();
    service.event.wish('10561673', function(response) {
        ok(response, "对活动感兴趣");
        start();
    });
});

test("测试对活动不感兴趣", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    stop();
    service.event.unwish('10561673', function(response) {
        ok(response, "对活动不感兴趣");
        start();
    });
});
*/

test("测试生成活动 XML", function() {
    var xml = Douban.event.createXML({
        title: '标题',
        content: '内容',
        isInviteOnly: true,
        startTime: new Date(1990, 10, 22, 12),
        endTime: new Date(2008, 3, 21, 4),
        address: '地址'
    });
    equals(xml, '<?xml version="1.0" encoding="UTF-8"?><entry xmlns="http://www.w3.org/2005/Atom" xmlns:db="http://www.douban.com/xmlns/" xmlns:gd="http://schemas.google.com/g/2005" xmlns:opensearch="http://a9.com/-/spec/opensearchrss/1.0/"><title>标题</title><category scheme="http://www.douban.com/2007#kind" term="http://www.douban.com/2007#event.music"/><content>内容</content><db:attribute name="invite_only">yes</db:attribute><db:attribute name="can_invite">yes</db:attribute><gd:when endTime="2008-04-21T04:00:00+08:00" startTime="1990-11-22T12:00:00+08:00"/><gd:where valueString="地址"></gd:where></entry>');
});
