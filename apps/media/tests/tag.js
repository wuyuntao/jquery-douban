module("豆瓣标签 API 测试");

test("测试获取条目的标签", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();
    var subject = 'http://api.douban.com/movie/subject/3158990';

    stop();
    tags = service.tag.getForSubject(subject, 5, 3, function(tags) {
        console.debug(tags);
        equals(tags.entry.length, 3);
        equals(tags.limit, 3);
        ok(tags.entry[0].id.match(/\/movie\/tag\/\w+$/), "okay: " + tags.entry[0].id);
        ok(tags.entry[0].name.length > 0, 'okay: ' + tags.entry[0].name);
        ok(tags.entry[0].count >= 684, "okay: " + tags.entry[0].count);
        start();
    });
});

test("测试获取用户的标签", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    stop();
    service.tag.getForUser('wyt', 2, 1, function(tags) {
        console.debug(tags);
        equals(tags.entry.length, 1);
        start();
    }, 'book');
});
