module("Douban Event Testcases");

test("test event api", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    /* get event
     */
    var evento = service.event.get('10288075');
    equals(evento.id, 'http://api.douban.com/event/10288075');
    equals(evento.title, '蜷川実花个展  ');

    /* get participants of event
    var participants = service.event.participants('10288075');
    ok(participants.total > 900, "get participants of event: " + participants.total);
     */

    /* get wishers of event
    var wishers = service.wishers('10288075');
    ok(wishers.total > 900, "get wishers of event: " + wishers.total);
     */

    /* get event for user
     */
    var eventos = service.event.getForUser('iloveshutuo');
    ok(eventos.total >= 1, "get total ok: " + eventos.total);
    // equals(eventos.limit, 50, "get limit ok: " + eventos.limit);
    ok(eventos.entries[0].id.match(/http:\/\/api\.douban\.com\/event\/\d+/), "get id ok: ");

    /* get events for city
    var eventos2 = service.event.getForCity('iloveshutuo');
    ok(eventos2.total > 1000, "get events for city: " + eventos2.total);
     */

    /* search events
    var eventos3 = service.event.search("蛋糕");
    ok(eventos3.total >= 7, "search events: " + eventos3.total);
    equals(eventos3.offset, 0, "get offset ok: " + eventos3.offset);
    equals(eventos3.limit, 50, "get limit ok: " + eventos3.limit);
    equals(eventos3.entries.length, 5, "get length ok: " + eventos3.entries.length);
     */

    /* create event
     */
    var evento2 = service.event.add({
        category: 'film',
        title: '测试添加活动',
        content: '测试添加活动内容',
        isInviteOnly: true,
        isInviteEnabled: false,
        startTime: new Date(2009, 1, 12, 20),
        endTime: new Date(2009, 2, 30, 9),
        address: '测试添加活动地址'
    });
    ok(evento2.id.match(/http:\/\/api\.douban\.com\/event\/\d+/), "get event id ok: " + evento2.id);

    /* update event
     */
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

    /* delete event
     */
    var response = service.event.remove(evento2);
    ok(response, 'event removed');
});

test("test event object", function() {
    var json = {"category":{"@scheme":"http://www.douban.com/2007#kind","@term":"http://www.douban.com/2007#event.party"},"db:location":{"$t":"上海","@id":"shanghai"},"title":{"$t":"{NianNian's Home}我来为他（她）做蛋糕"},"gd:when":{"@endTime":"2008-11-30T21:00:00+08:00","@startTime":"2008-11-01T13:00:00+08:00"},"author":{"link":[{"@rel":"self","@href":"http://api.douban.com/people/1162488"},{"@rel":"alternate","@href":"http://www.douban.com/people/yiyun_tsai/"},{"@rel":"icon","@href":"http://otho.douban.com/icon/u1162488-48.jpg"}],"uri":{"$t":"http://api.douban.com/people/1162488"},"name":{"$t":"蔡粘粘"}},"summary":[{"$t":"注：如想收到更多关于聆舞文化联盟、聆舞剧团、聆舞创意、NianNian's Home的活动信息请加入我们的邮件组：http://www.linc2.org/mailinglist/\r\n\r\n————————————————————————————————\r\n{NianNian's Home}我来为他（她）做蛋糕\r\n\r\n他的生日快到了，很想亲手为他做一只独一无二的蛋糕，哪怕不好吃，不好看，也是我..."}],"content":[{"$t":"注：如想收到更多关于聆舞文化联盟、聆舞剧团、聆舞创意、NianNian's Home的活动信息请加入我们的邮件组：http://www.linc2.org/mailinglist/\r\n\r\n————————————————————————————————\r\n{NianNian's Home}我来为他（她）做蛋糕\r\n\r\n他的生日快到了，很想亲手为他做一只独一无二的蛋糕，哪怕不好吃，不好看，也是我..."}],"link":[{"@rel":"self","@href":"http://api.douban.com/event/10132699"},{"@rel":"alternate","@href":"http://www.douban.com/event/10132699/"},{"@rel":"image","@href":"http://otho.douban.com/mpic/e23411.jpg"}],"db:attribute":[{"$t":"no","@name":"invite_only"},{"$t":"yes","@name":"can_invite"},{"$t":371,"@name":"participants"},{"$t":939,"@name":"wishers"}],"id":{"$t":"http://api.douban.com/event/10132699"},"gd:where":{"@valueString":"上海 长乐路682弄6号后门4F"}}


    var evento = $.douban('event', json);
    var date1 = new Date(2008, 10, 1, 13);
    var date2 = new Date(2008, 10, 30, 21);
    equals(evento.id, "http://api.douban.com/event/10132699");
    equals(evento.title, "{NianNian's Home}我来为他（她）做蛋糕");
    equals(evento.owner.id, "http://api.douban.com/people/1162488");
    equals(evento.category, 'party');
    equals(evento.location, '上海');
    equals(evento.startTime.getTime(), date1.getTime(), "get start time ok: " + evento.startTime);
    equals(evento.endTime.getTime(), date2.getTime(), "get end time ok: " + evento.endTime);
    equals(evento.address, "上海 长乐路682弄6号后门4F");
    equals(evento.isInviteOnly, false);
    equals(evento.isInviteEnabled, true);
    equals(evento.participants, 371);
    equals(evento.wishers, 939);

    var xml = $.douban.createXml('event', {
        title: '标题',
        content: '内容',
        isInviteOnly: true,
        startTime: new Date(1990, 10, 22, 12),
        endTime: new Date(2008, 3, 21, 4),
        address: '地址'
    });
    equals(xml, '<?xml version="1.0" encoding="UTF-8"?><entry xmlns="http://www.w3.org/2005/Atom" xmlns:db="http://www.douban.com/xmlns/" xmlns:gd="http://schemas.google.com/g/2005" xmlns:opensearch="http://a9.com/-/spec/opensearchrss/1.0/"><title>标题</title><category scheme="http://www.douban.com/2007#kind" term="http://www.douban.com/2007#event.music"/><content>内容</content><db:attribute name="invite_only">yes</db:attribute><db:attribute name="can_invite">yes</db:attribute><gd:when endTime="2008-04-21T04:00:00+08:00" startTime="1990-11-22T12:00:00+08:00"/><gd:where valueString="地址"></gd:where></entry>');
});

// vim: foldmethod=indent
