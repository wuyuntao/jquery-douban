module("豆瓣推荐 API 测试");

test("测试获取单个推荐", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();
    var re = /http:\/\/api\.douban\.com\/recommendation\/\d+/;

    stop();
    service.recommendation.get('3917477', function(recomm) {
        console.debug(recomm);
        ok(recomm.id.match(re), "get id ok");
        equals(recomm.comment, "shogun, ninjia, oneal会的日文还不少么");
        start();
    });
});

test("测试获取用户推荐", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();
    var re = /http:\/\/api\.douban\.com\/recommendation\/\d+/;

    stop();
    service.recommendation.getForUser('wyt', 10, 10, function(recomms) {
        console.debug(recomms);
        equals(recomms.offset, 10);
        ok(recomms.entry[9].id.match(re), "get recommendation id");
        ok(recomms.entry[9].category.match(/\w+/), "get type ok");
        start();
    });
});

test("测试添加推荐", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    stop();
    service.recommendation.add({
        title: 'luliban.com',
        url: 'http://blog.luliban.com/',
        comment: 'My blog' }, function(recomm) {
        console.debug(recomm);
        equals(recomm.title, '推荐luliban.com');
        equals(recomm.comment, 'My blog');
        start();
    });
});

test("测试添加推荐评论", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();
    var re = /http:\/\/api\.douban\.com\/recommendation\/\d+\/comment\/\d+/;

    stop();
    service.recommendation.addComment("5945817", {
        content: '回复你个头啦' }, function(comment) {
        console.debug(comment);
        ok(comment.id.match(re), "get id ok");
        ok(comment.content, '回复你个头啦', "get content ok");
        start();
    });
});

test("测试获取推荐的评论", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();
    var re = /http:\/\/api\.douban\.com\/recommendation\/\d+\/comment\/\d+/;

    stop();
    service.recommendation.getComments("5945817", 0, 50, function(comments) {
        console.debug(comments);
        ok(comments.total > 0, "get total comments ok");
        ok(comments.entry[0].id.match(re), "get comment id ok");
        start();
    });
});

test("测试删除推荐的评论", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();
    var comment = "http://api.douban.com/recommendation/5945817/comment/430247";

    /*
    stop();
    service.recommendation.removeComment(comment, function(response) {
        ok(response, "comment removed");
        start();
    });
    */
});

test("测试删除用户推荐", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    /*
    stop();
    service.recommendation.remove("5945830", function(response) {
        ok(response, "recommendation removed");
        start();
    });
    */
});
