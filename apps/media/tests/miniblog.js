module("广播 API 测试");

test("测试获取用户广播", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();
    var re = /http:\/\/api\.douban\.com\/miniblog\/\d+/;

    stop();
    service.miniblog.getForUser('wyt', 10, 10, function(miniblogs) {
        console.debug(miniblogs);
        equals(miniblogs.offset, 10);
        ok(miniblogs.entry[9].id.match(re), "get miniblog id");
        start();
    });
});

test("测试获取用户友邻广播", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();
    var re = /http:\/\/api\.douban\.com\/miniblog\/\d+/;

    stop();
    service.miniblog.getForContacts('iloveshutuo', 9, 9, function(miniblogs) {
        console.debug(miniblogs);
        equals(miniblogs.limit, 9);
        ok(miniblogs.entry[5].id.match(re), "get miniblog id");
        start();
    });
});

test("测试添加广播", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    stop();
    service.miniblog.add({ content: '真是的，这是什么啊' }, function(miniblog) {
        console.debug(miniblog);
        equals(miniblog.content, '真是的，这是什么啊');
        start();
    });
});

test("测试删除广播", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    /*
    stop();
    service.miniblog.remove("120562453", function(response) {
       ok(response, "miniblog removed");
       start();
    });
    */
});

test("测试生成广播 XML", function() {
    var xml = Douban.miniblog.createXML({ content: '内容' });
    equals(xml, '<?xml version="1.0" encoding="UTF-8"?><entry xmlns:ns0="http://www.w3.org/2005/Atom" xmlns:db="http://www.douban.com/xmlns/"><content>内容</content></entry>');
});
