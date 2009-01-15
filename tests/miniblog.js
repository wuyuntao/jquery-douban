/* Only ``getForContacts`` should be tested
 */
test("test miniblog api", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    /* get miniblog for user
     */
    miniblogs = service.miniblog.getForUser('wyt', 10, 10);
    equals(miniblogs.offset, 10);
    ok(miniblogs.entries[9].id.match(/http:\/\/api\.douban\.com\/miniblog\/\d+/), "get miniblog id");

    /* get miniblog for contacts
     */
    miniblogs2 = service.miniblog.getForContacts('iloveshutuo', 9, 9);
    equals(miniblogs2.limit, 9);
    ok(miniblogs2.entries[5].id.match(/http:\/\/api\.douban\.com\/miniblog\/\d+/), "get miniblog id");

    /* add miniblog
     */
    miniblog = service.miniblog.add({ content: '真是的，这是什么啊' });
    equals(miniblog.content, '真是的，这是什么啊');

    /* remove miniblog
     */
    var response = service.miniblog.remove(miniblog);
    ok(response, "miniblog removed");
});

test("test miniblog object", function() {
    var json = {"content":{"$t":"在看康熙卸妆那集，google广告提示“如何去掉脸上的豆豆，豆印”～～","@type":"html"},"category":[{"@scheme":"http://www.douban.com/2007#kind","@term":"http://www.douban.com/2007#miniblog.saying"}],"title":{"$t":"在看康熙卸妆那集，google广告提示“如何去掉脸上的豆豆，豆印”～～"},"id":{"$t":"http://api.douban.com/miniblog/80210749"},"published":{"$t":"2008-11-20T20:43:25+08:00"}};

    var miniblog = $.douban('miniblog', json);
    var date = new Date(2008, 10, 20, 20, 43, 25);
    equals(miniblog.id, "http://api.douban.com/miniblog/80210749");
    equals(miniblog.title, "在看康熙卸妆那集，google广告提示“如何去掉脸上的豆豆，豆印”～～");
    equals(miniblog.content, "在看康熙卸妆那集，google广告提示“如何去掉脸上的豆豆，豆印”～～");
    equals(miniblog.published.getTime(), date.getTime());
    equals(miniblog.category, "saying");
    equals(miniblog.imageUrl, undefined);

    var xml = $.douban.createXml('miniblog', { content: '内容' });
    equals(xml, '<?xml version="1.0" encoding="UTF-8"?><entry xmlns:ns0="http://www.w3.org/2005/Atom" xmlns:db="http://www.douban.com/xmlns/"><content>内容</content></entry>');
});

// vim: foldmethod=indent
