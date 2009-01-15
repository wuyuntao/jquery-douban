/* Only ``getForUser`` needed be tested
 */
test("test collection api", function() {
    expect(21);

    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    /* get collection by id
     */
    var collection = service.collection.get('21701587');
    var date = new Date(2007, 09, 09, 23, 03, 42);
    equals(collection.id, "http://api.douban.com/collection/21701587", "get collection id ok");
    ok(collection.title.length > 0, "get collection title ok: " + collection.title);
    equals(collection.owner.id, "http://api.douban.com/people/1309094", "get owner id ok");
    ok(collection.owner.screenName.length > 0, "get owner name ok: " + collection.owner.screenName);
    equals(collection.subject.id, "http://api.douban.com/book/subject/1731370");
    equals(collection.subject.title, "东方快车谋杀案");
    equals(collection.updated.getTime(), date.getTime(), "get collection updated time ok");

    /* get collections of user by user id
     */
    var collections = service.collection.getForUser('NullPointer', 4, 2);
    ok(collections.total >= 908, "get total collections ok"); 
    equals(collections.offset, 4, "get collections of np start index ok");
    equals(collections.limit, 2, "get collections of np max results ok");
    equals(collections.entries.length, 2, "get collections of np ok");
    ok(collections.entries[0].id.match(/http:\/\/api\.douban\.com\/collection\/\d+/), "get collection id ok");
    // Not author but owner or user
    var user = collections.author;
    equals(user.screenName, "NullPointer", "get author of collections ok");

    /* get book collection
     */
    var collections2 = service.collection.getForUser('wyt', 4, 2, null, { 'cat': 'book' });
    ok(collections2.total >= 494, "okay:" + collections2.total);
    ok(collections2.entries[0].id.match(/http:\/\/api\.douban\.com\/collection\/\d+/), "get collection id ok");

    /* add a new collection
     */
    var collection3 = service.collection.add({ subject: collection.subject, content: "没错，当时就是这样", tags: ['东方', '谋杀', '小说'], status: 'read' });
    ok(collection3.id.match(/http:\/\/api\.douban\.com\/collection\/\d+/), "get id of collection ok");
    equals(collection3.title, 'ilovest 读过 东方快车谋杀案', "get title of collection ok");
    // equals(collection3.content, '没错，当时就是这样');
    equals(collection3.tags.length, 3, "get length of tags ok");

    /* update the collection
     */
    var collection4 = service.collection.update(collection3, { status: 'wish', content: "错了，当时不是这样的" });
    ok(collection4.id.match(/http:\/\/api\.douban\.com\/collection\/\d+/), "get id of collection ok");
    equals(collection4.title, "ilovest 想读 东方快车谋杀案", "get title of collection ok");
    // equals(collection4.content, '错了，当时不是这样的', "get content of collection ok");

    /* remove the collection
     */
    var response = service.collection.remove(collection4);
    ok(response , "collection removed");
});

test("test collection object", function() {
    var json = {"updated":{"$t":"2006-03-30T00:10:03+08:00"},"author":{"link":[{"@rel":"self","@href":"http://api.douban.com/people/1025061"},{"@rel":"alternate","@href":"http://www.douban.com/people/Fenng/"},{"@rel":"icon","@href":"http://otho.douban.com/icon/u1025061-3.jpg"}],"uri":{"$t":"http://api.douban.com/people/1025061"},"name":{"$t":"Fenng(DBAnotes)"}},"title":{"$t":"Fenng(DBAnotes) 想读 国际经济学（第五版）"},"db:subject":{"category":{"@scheme":"http://www.douban.com/2007#kind","@term":"http://www.douban.com/2007#book"},"author":[{"name":{"$t":"(美)克鲁格曼"}}],"title":{"$t":"国际经济学（第五版）"},"link":[{"@rel":"self","@href":"http://api.douban.com/book/subject/1263907"},{"@rel":"alternate","@href":"http://www.douban.com/subject/1263907/"},{"@rel":"image","@href":"http://otho.douban.com/spic/s2701851.jpg"}],"db:attribute":[{"$t":"7300040187","@name":"isbn10"},{"$t":"9787300040189","@name":"isbn13"},{"$t":"79.0","@name":"price"},{"$t":"(美)克鲁格曼","@name":"author"},{"$t":"中国人民大学出版社","@name":"publisher"},{"$t":"海闻等","@name":"translator"},{"$t":"2002-11-1","@name":"pubdate"}],"id":{"$t":"http://api.douban.com/book/subject/1263907"}},"link":[{"@rel":"self","@href":"http://api.douban.com/collection/2165271"},{"@rel":"http://www.douban.com/2007#subject","@href":"http://api.douban.com/book/subject/1263907"}],"id":{"$t":"http://api.douban.com/collection/2165271"},"db:status":{"$t":"wish"}};
    
    var collection = $.douban('collection', json);
    equals(collection.id, "http://api.douban.com/collection/2165271");
    equals(collection.owner.id, "http://api.douban.com/people/1025061");
    equals(collection.subject.id, "http://api.douban.com/book/subject/1263907");
    equals(collection.status, "wish");
    equals(collection.tags.length, 0);

    var xml = $.douban.createXml('collection', { subject: '条目', status: '状态', content: '评价', rating: 5, tags: ['标签一', '标签二', '标签三'], isPrivate: true });
    equals(xml, '<?xml version="1.0" encoding="UTF-8"?><entry xmlns:ns0="http://www.w3.org/2005/Atom" xmlns:db="http://www.douban.com/xmlns/"><db:subject><id>条目</id></db:subject><db:status>状态</db:status><db:tag name="标签一"></db:tag><db:tag name="标签二"></db:tag><db:tag name="标签三"></db:tag><content>评价</content><gd:rating xmlns:gd="http://schemas.google.com/g/2005" value="5" ></gd:rating><db:attribute name="privacy">private</db:attribute></entry>');
});

// vim: foldmethod=indent
