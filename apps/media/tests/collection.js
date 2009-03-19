module("收藏 API 测试");

test("获取单个收藏", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    stop();
    service.collection.get('104994982', function(collection) {
        console.debug(collection);
        equals(collection.id, "http://api.douban.com/collection/104994982",
               "get collection id ok");
        equals(collection.title, "ilovest1 在读 我们去哪儿",
               "get collection title ok");
        equals(collection.owner.id, "http://api.douban.com/people/2133418",
               "get owner id ok");
        equals(collection.owner.name, 'ilovest1', "get owner name ok");
        equals(collection.subject.id,
               "http://api.douban.com/book/subject/1868896");
        equals(collection.subject.title, "我们去哪儿");
        ok(!collection.isPublic, "私有收藏");
        equals(collection.updated, "2009-03-19T09:14:10+08:00",
               "get collection updated time ok");
        start();
    });
});

test("获取用户收藏", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    stop();
    service.collection.getForUser('NullPointer', 4, 2, function(collections) {
        console.debug(collections);
        ok(collections.total >= 908, "get total collections ok"); 
        equals(collections.offset, 4, "get collections of np start index ok");
        equals(collections.limit, 2, "get collections of np max results ok");
        equals(collections.entry.length, 2, "get collections of np ok");
        ok(collections.entry[0].id.match(/http:\/\/api\.douban\.com\/collection\/\d+/), "get collection id ok");
        // Not author but owner or user
        var user = collections.author;
        equals(user.name, "NullPointer", "get author of collections ok");
        start();
    });
});

test("添加收藏", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    stop();
    service.collection.add({
        subject: '1297131',
        content: "没错，当时就是这样",
        tags: ['动画', '美国', '喜剧'],
        status: 'watched' }, function(collection) {
        console.debug(collection);
        ok(collection.id.match(/http:\/\/api\.douban\.com\/collection\/\d+/),
           "get id of collection ok");
        equals(collection.title, 'ilovest1 看过 The Nightmare before Christmas',
               "get title of collection ok");
        equals(collection.summary, '没错，当时就是这样');
        equals(collection.tag.length, 3, "get length of tags ok");
        start();
    });
});

test("更新收藏", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    stop();
    service.collection.update('105014084', {
        status: 'wish',
        content: "错了，当时不是这样的" }, function(collection) {
        console.debug(collection);
        ok(collection.id.match(/http:\/\/api\.douban\.com\/collection\/\d+/),
           "get id of collection ok");
        equals(collection.title, "ilovest1 想看 The Nightmare before Christmas",
               "get title of collection ok");
        equals(collection.summary, '错了，当时不是这样的',
               "get content of collection ok");
        start();
    });
});

test("删除收藏", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    /* 
    stop();
    service.collection.remove('105014084', function(response) {
        ok(response , "collection removed");
        start();
    });
    */
});

test("测试生成XML", function() {
    var xml = Douban.collection.createXML({
        subject: '条目',
        status: '状态',
        content: '评价',
        rating: 5,
        tags: ['标签一', '标签二', '标签三'],
        isPrivate: true
    });
    equals(xml, '<?xml version="1.0" encoding="UTF-8"?><entry xmlns:ns0="http://www.w3.org/2005/Atom" xmlns:db="http://www.douban.com/xmlns/"><db:subject><id>条目</id></db:subject><db:status>状态</db:status><db:tag name="标签一"></db:tag><db:tag name="标签二"></db:tag><db:tag name="标签三"></db:tag><content>评价</content><gd:rating xmlns:gd="http://schemas.google.com/g/2005" value="5" ></gd:rating><db:attribute name="privacy">private</db:attribute></entry>');
});
