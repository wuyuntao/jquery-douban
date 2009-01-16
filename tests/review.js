module("Douban Review Testcases");

/* Only ``getForSubject`` need be tested
 */
test("test review api", function() {
    expect(20);

    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    /* get review
     */
    var review = service.review.get('1523679');
    equals(review.title, '第二季第二话');
    equals(review.author.screenName, '真月居深红魅玉大圣天');
    equals(review.rating, 5);

    /* get review for user
     */
    var reviews = service.review.getForUser(review.author, 3, 3);
    equals(reviews.total, 5);
    equals(reviews.offset, 3);
    equals(reviews.limit, 3);
    equals(reviews.entries.length, 2);

    /* get review for subject
    */
    var reviews2 = service.review.getForSubject('http://api.douban.com/movie/subject/3199462');
    ok(reviews2.total > 0, "okay: " + reviews2.total);
    equals(reviews2.offset, 0);
    equals(reviews2.limit, 50);
    ok(reviews2.entries.length > 0, "okay: " + reviews2.entries.length);

    /* add
     */
    var review2 = service.review.add({ subject: 'http://api.douban.com/music/subject/3288632', title: "测试", content: "评论的内容不会太短了吧，可恶的测试啊。果然就是太短了，可恶的测试啊。评论的内容不会太短了吧，可恶的测试啊。果然就是太短了，可恶的测试啊。评论的内容不会太短了吧，可恶的测试啊。果然就是太短了，可恶的测试啊。评论的内容不会太短了吧，可恶的测试啊。果然就是太短了，可恶的测试啊。", rating: 5 });
    equals(review2.title, "测试");
    equals(review2.content, "评论的内容不会太短了吧，可恶的测试啊。果然就是太短了，可恶的测试啊。评论的内容不会太短了吧，可恶的测试啊。果然就是太短了，可恶的测试啊。评论的内容不会太短了吧，可恶的测试啊。果然就是太短了，可恶的测试啊。评论的内容不会太短了吧，可恶的测试啊。果然就是太短了，可恶的测试啊。");
    equals(review2.author.screenName, 'ilovest');
    equals(review2.rating, 5);
    
    /* update
     */
    var review3 = service.review.update(review2, { title: "测试更新", content: "更新后评论的内容不会太短了吧，可恶的测试啊。更新后评论的内容不会太短了吧，可恶的测试啊。更新后评论的内容不会太短了吧，可恶的测试啊。更新后评论的内容不会太短了吧，可恶的测试啊。更新后评论的内容不会太短了吧，可恶的测试啊。", rating: 4 });
    equals(review3.title, "测试更新");
    equals(review3.content, "更新后评论的内容不会太短了吧，可恶的测试啊。更新后评论的内容不会太短了吧，可恶的测试啊。更新后评论的内容不会太短了吧，可恶的测试啊。更新后评论的内容不会太短了吧，可恶的测试啊。更新后评论的内容不会太短了吧，可恶的测试啊。");
    equals(review3.author.screenName, 'ilovest');
    equals(review3.rating, 4);

    /* remove
     */
    var response = service.review.remove(review2);
    ok(response, "review removed");
});

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

// vim: foldmethod=indent
