function createService() {
    var service = $.douban('service', { key: '0107c5c3c9d4ecc40317514b5d7ec64c', secret: '7feaf4ec7b6989f8', type: 'jquery' });
    service.login({ key: '242968ea69f7cbc46c7c3abf3de7634c', secret: '9858f453d21ab6e0' });
    return service;
}

test("test misc", function() {
});

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

/* Only ``getForSubject`` should be tested
 */
test("test review api", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    /* get review
    var review = service.review.get('1523679');
    equals(review.title, '第二季第二话');
    equals(review.author.screenName, '真月居深红魅玉大圣天');
    equals(review.rating, 5);
     */

    /* get review for user
    var reviews = service.review.getForUser(review.author, 3, 3);
    equals(reviews.total, 5);
    equals(reviews.offset, 3);
    equals(reviews.limit, 3);
    equals(reviews.entries.length, 2);
     */

    /* get review for subject
    */
    var reviews2 = service.review.getForSubject('http://api.douban.com/movie/subject/3199462');
    equals(reviews2.total, 6);
    equals(reviews2.offset, 0);
    equals(reviews2.limit, 50);
    equals(reviews2.entries.length, 6);

    /* add
    var review2 = service.review.add({ subject: 'http://api.douban.com/music/subject/3288632', title: "测试", content: "评论的内容不会太短了吧，可恶的测试啊。果然就是太短了，可恶的测试啊。评论的内容不会太短了吧，可恶的测试啊。果然就是太短了，可恶的测试啊。评论的内容不会太短了吧，可恶的测试啊。果然就是太短了，可恶的测试啊。评论的内容不会太短了吧，可恶的测试啊。果然就是太短了，可恶的测试啊。", rating: 5 });
    equals(review2.title, "测试");
    equals(review2.content, "评论的内容不会太短了吧，可恶的测试啊。果然就是太短了，可恶的测试啊。评论的内容不会太短了吧，可恶的测试啊。果然就是太短了，可恶的测试啊。评论的内容不会太短了吧，可恶的测试啊。果然就是太短了，可恶的测试啊。评论的内容不会太短了吧，可恶的测试啊。果然就是太短了，可恶的测试啊。");
    equals(review2.author.screenName, 'ilovest');
    equals(review2.rating, 5);
     */
    
    /* update
    var review3 = service.review.update(review2, { title: "测试更新", content: "更新后评论的内容不会太短了吧，可恶的测试啊。更新后评论的内容不会太短了吧，可恶的测试啊。更新后评论的内容不会太短了吧，可恶的测试啊。更新后评论的内容不会太短了吧，可恶的测试啊。更新后评论的内容不会太短了吧，可恶的测试啊。", rating: 4 });
    equals(review3.title, "测试更新");
    equals(review3.content, "更新后评论的内容不会太短了吧，可恶的测试啊。更新后评论的内容不会太短了吧，可恶的测试啊。更新后评论的内容不会太短了吧，可恶的测试啊。更新后评论的内容不会太短了吧，可恶的测试啊。更新后评论的内容不会太短了吧，可恶的测试啊。");
    equals(review3.author.screenName, 'ilovest');
    equals(review3.rating, 4);
     */

    /* remove
    var response = service.review.remove(review2);
    ok(response, "review removed");
     */
});

test("test recommendation api", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    /* get recommendation
     */
    var recomm = service.recommendation.get('3917477');
    equals(recomm.id, 'http://api.douban.com/recommendation/3917477', "get id ok");

    /* get recommendation for user
     */
    var recommendations = service.recommendation.getForUser('wyt', 10, 10);
    equals(recommendations.offset, 10);
    ok(recommendations.entries[9].id.match(/http:\/\/api\.douban\.com\/recommendation\/\d+/), "get recommendation id");
    ok(recommendations.entries[9].type.match(/\w+/), "get type ok");

    /* add recommendation
     */
    var recomm2 = service.recommendation.add({ title: 'luliban.com', url: 'http://blog.luliban.com/', comment: 'My blog' });
    equals(recomm2.title, '推荐luliban.com');
    equals(recomm2.comment, 'My blog');

    /* add comment for recommendation
     */
    var comment = service.recommendation.addComment(recomm2, { content: '回复你个头啦' });
    ok(comment.id.match(/http:\/\/api\.douban\.com\/recommendation\/\d+\/comment\/\d+/), "get id ok");
    ok(comment.content, '回复你个头啦', "get content ok");

    /* get comment for recommendation
     */
    var comments = service.recommendation.getComment(recomm2);
    equals(comments.total, 1, "get total comments ok");
    equals(comments.entries[0].id, comment.id, "get comment id ok");

    /* remove comment for recommendation
     */
    var response = service.recommendation.removeComment(comment);
    ok(response, "comment removed");

    /* remove recommendation
     */
    var response2 = service.recommendation.remove(recomm2);
    ok(response2, "recommendation removed");
});

test("test tag api", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    /* get for subject
     */
    tags = service.tag.getForSubject('http://api.douban.com/movie/subject/3158990', 5, 3);
    equals(tags.entries.length, 3);
    equals(tags.limit, 3);
    equals(tags.entries[0].id, 'http://api.douban.com/movie/tag/范逸臣');
    equals(tags.entries[0].name, '范逸臣');
    ok(tags.entries[0].count >= 684, "get tag count ok");

    /* get for user
     */
    tags2 = service.tag.getForUser('wyt', 2, 1, null, 'book');
    equals(tags2.entries.length, 1);
});

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

module("Douban Object Testcases");

test("test review object", function() {
    var json = {"updated":{"$t":"2007-06-16T14:21:06+08:00"},"author":{"link":[{"@rel":"self","@href":"http://api.douban.com/people/1615529"},{"@rel":"alternate","@href":"http://www.douban.com/people/1615529/"}],"uri":{"$t":"http://api.douban.com/people/1615529"},"name":{"$t":"唐五"}},"title":{"$t":"好书"},"db:subject":{"category":{"@scheme":"http://www.douban.com/2007#kind","@term":"http://www.douban.com/2007#book"},"author":[{"name":{"$t":"萧如瑟"}}],"title":{"$t":"九州·斛珠夫人"},"link":[{"@rel":"self","@href":"http://api.douban.com/book/subject/1452923"},{"@rel":"alternate","@href":"http://www.douban.com/subject/1452923/"},{"@rel":"image","@href":"http://otho.douban.com/spic/s1515387.jpg"}],"db:attribute":[{"$t":"780187921X","@name":"isbn10"},{"$t":"9787801879219","@name":"isbn13"},{"$t":"新世界出版社","@name":"publisher"},{"$t":"20.0","@name":"price"},{"$t":"萧如瑟","@name":"author"},{"$t":"2006-01","@name":"pubdate"}],"id":{"$t":"http://api.douban.com/book/subject/1452923"}},"summary":{"$t":"男人与男人之间的感情"},"link":[{"@rel":"self","@href":"http://api.douban.com/review/1168468"},{"@rel":"alternate","@href":"http://www.douban.com/review/1168468/"},{"@rel":"http://www.douban.com/2007#subject","@href":"http://api.douban.com/book/subject/1452923"}],"published":{"$t":"2007-06-16T14:21:06+08:00"},"id":{"$t":"http://api.douban.com/review/1168468"},"gd:rating":{"@min":1,"@value":"5","@max":5}};

    var review = $.douban('review', json);
    var date1 = new Date(2007, 05, 16, 14, 21, 06);
    var date2 = new Date(2007, 05, 16, 14, 21, 06);
    equals(review.id, "http://api.douban.com/review/1168468", "get review id ok");
    equals(review.title, "好书", "get review title ok");
    equals(review.author.id, "http://api.douban.com/people/1615529", "get author id ok");
    equals(review.author.screenName, "唐五", "get author name ok");
    equals(review.summary, "男人与男人之间的感情", "get review summary ok");
    equals(review.published.getTime(), date1.getTime(), "get review published time ok");
    equals(review.updated.getTime(), date2.getTime(), "get review updated time ok");
    equals(review.url, "http://www.douban.com/review/1168468/", "get review url ok");
    equals(review.rating, 5);
    equals(review.subject.id, "http://api.douban.com/book/subject/1452923");

    var review2 = $.douban('review');
    equals(review2.id, undefined);

    // create xml
    var xml = $.douban.createXml('review', { subject: "http://api.douban.com/book/subject/1452923", title: "标题", content: "内容", rating: 3 });
    equals(xml, '<?xml version="1.0" encoding="UTF-8"?><entry xmlns:ns0="http://www.w3.org/2005/Atom"><db:subject xmlns:db="http://www.douban.com/xmlns/"><id>http://api.douban.com/book/subject/1452923</id></db:subject><content>内容</content><gd:rating xmlns:gd="http://schemas.google.com/g/2005" value="3" ></gd:rating><title>标题</title></entry>', "get xml ok");
});

test("test recommendation object", function() {
    var json = {"title":{"$t":"推荐喵喵喵之小团子"},"content":{"$t":"推荐<a href=\"http://www.douban.com/photos/album/12573993/\">喵喵喵之小团子</a>","@type":"html"},"link":[],"published":{"$t":"2008-11-07T08:28:40+08:00"},"db:attribute":[{"$t":"photo_album","@name":"category"},{"$t":"团子，我家团子，以前觉得她小时候很丑，现在觉得一点也不丑啊～哇哈哈哈","@name":"comment"},{"$t":7,"@name":"comments_count"}],"id":{"$t":"http://api.douban.com/recommendation/3673470"}};

    var recommendation = $.douban('recommendation', json);
    var date = new Date(2008, 10, 07, 08, 28, 40);
    equals(recommendation.id, "http://api.douban.com/recommendation/3673470");
    equals(recommendation.title, "推荐喵喵喵之小团子", "get title ok");
    equals(recommendation.content, "推荐<a href=\"http://www.douban.com/photos/album/12573993/\">喵喵喵之小团子</a>");
    equals(recommendation.published.getTime(), date.getTime(), "get time ok" + recommendation.published);
    equals(recommendation.type, "photo_album", "get type ok");
    equals(recommendation.comment, "团子，我家团子，以前觉得她小时候很丑，现在觉得一点也不丑啊～哇哈哈哈", "get comment ok");
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
