test("test recommendation api", function() {
    expect(12);
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

// vim: foldmethod=indent
