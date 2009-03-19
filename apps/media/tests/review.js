module("豆瓣评论 API 测试");

test("测试获取评论信息", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    stop();
    service.review.get('1523679', function(review) {
        console.debug(review);
        equals(review.title, '第二季第二话');
        equals(review.author.name, '大佐');
        equals(review.rating.value, 5);
        ok(review.summary.length > 0, "评论内容：" + review.summary);
        start();
    });
});

test("测试获取用户评论", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    stop();
    service.review.getForUser('3019273', 3, 3, function(reviews) {
        console.debug(reviews);
        equals(reviews.total, 10);
        equals(reviews.offset, 3);
        equals(reviews.limit, 3);
        equals(reviews.entry.length, 3);
        start();
    });
});

test("测试获取条目评论", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    stop();
    service.review.getForSubject('http://api.douban.com/movie/subject/imdb/tt0213338', 3, 3, function(reviews) {
        console.debug(reviews);
        ok(reviews.total > 0, "okay: " + reviews.total);
        equals(reviews.offset, 3);
        equals(reviews.limit, 3);
        ok(reviews.entry.length > 0, "okay: " + reviews.entry.length);
        start();
    }, { 'orderby': 'time' });
});

test("测试添加条目评论", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    /*
    stop();
    service.review.add({
        subject: 'http://api.douban.com/music/subject/3288632',
        title: "测试",
        content: "评论的内容不会太短了吧，可恶的测试啊。果然就是太短了，可恶的测试啊。评论的内容不会太短了吧，可恶的测试啊。果然就是太短了，可恶的测试啊。评论的内容不会太短了吧，可恶的测试啊。果然就是太短了，可恶的测试啊。评论的内容不会太短了吧，可恶的测试啊。果然就是太短了，可恶的测试啊。",
        rating: 5 }, function(review) {
        console.debug(review);
        equals(review.title, "测试");
        equals(review.content, "评论的内容不会太短了吧，可恶的测试啊。果然就是太短了，可恶的测试啊。评论的内容不会太短了吧，可恶的测试啊。果然就是太短了，可恶的测试啊。评论的内容不会太短了吧，可恶的测试啊。果然就是太短了，可恶的测试啊。评论的内容不会太短了吧，可恶的测试啊。果然就是太短了，可恶的测试啊。");
        equals(review.author.name, 'ilovest1');
        equals(review.rating.value, 5);
        start();
    });
    */
});

test("测试更新条目评论", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    /*
    stop();
    service.review.update('1898976', {
        title: "测试更新",
        content: "更新后评论的内容不会太短了吧，可恶的测试啊。更新后评论的内容不会太短了吧，可恶的测试啊。更新后评论的内容不会太短了吧，可恶的测试啊。更新后评论的内容不会太短了吧，可恶的测试啊。更新后评论的内容不会太短了吧，可恶的测试啊。",
        rating: 4 }, function(review) {
        console.debug(review);
        equals(review.title, "测试更新");
        equals(review.content, "更新后评论的内容不会太短了吧，可恶的测试啊。更新后评论的内容不会太短了吧，可恶的测试啊。更新后评论的内容不会太短了吧，可恶的测试啊。更新后评论的内容不会太短了吧，可恶的测试啊。更新后评论的内容不会太短了吧，可恶的测试啊。");
        equals(review.author.name, 'ilovest1');
        equals(review.rating.value, 4);
        start();
    });
    */
});

test("测试删除条目评论", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    /*
    stop();
    service.review.remove('1898976', function(response) {
        ok(response, "review removed");
        start();
    });
    */
});

test("测试生成评论 XML", function() {
    var xml = Douban.review.createXML({
        subject: "http://api.douban.com/book/subject/1452923",
        title: "标题",
        content: "内容",
        rating: 3
    });
    equals(xml, '<?xml version="1.0" encoding="UTF-8"?><entry xmlns:ns0="http://www.w3.org/2005/Atom"><db:subject xmlns:db="http://www.douban.com/xmlns/"><id>http://api.douban.com/book/subject/1452923</id></db:subject><content>内容</content><gd:rating xmlns:gd="http://schemas.google.com/g/2005" value="3" ></gd:rating><title>标题</title></entry>', "get xml ok");
});
