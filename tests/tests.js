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

module("OAuth Client Testcases");

test("test factory method", function() {
    var client = $.douban('client', { key: '1', secret: '2' });
    equals(client.api.key, '1', "api key expected to be 1");
    equals(client.api.secret, '2', "api secret expected to be 2");
    equals(client._http.name, 'jquery', "http type expected to be \"jquery\"");
});

test("test authorization step 1: get request token", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");

    var client = $.douban('client', { key: '0107c5c3c9d4ecc40317514b5d7ec64c', secret: '7feaf4ec7b6989f8' });
    var requestToken = client.getRequestToken();
    equals(requestToken.key.length, 32, "check the length of request key ( \"" + requestToken.key + "\" )");
    equals(requestToken.secret.length, 16, "check the length of request secret ( \"" + requestToken.secret + "\" )");
});

test("test authorization step 2: get authorization url", function() {
    var client = $.douban('client', { key: '1', secret: '2' });
    var callback = 'mycallback';
    // Set request token manually
    client.requestToken = { key: '3', secret: '4' };

    var url = client.getAuthorizationUrl(callback);
    equals(url, 'http://www.douban.com/service/auth/authorize?oauth_token=3&oauth_callback=mycallback');

    var url2 = client.getAuthorizationUrl({ key: '5', secret: '6' }, callback);
    equals(url2, 'http://www.douban.com/service/auth/authorize?oauth_token=5&oauth_callback=mycallback');
});

test("test authorization step 3: get access token ", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");

    var client = $.douban('client', { key: '0107c5c3c9d4ecc40317514b5d7ec64c', secret: '7feaf4ec7b6989f8' });
    client.requestToken = { key: 'ad6a4a13fb9b1ce7083ede3bf2d156b5',
                            secret: '6fb16ea234a309fd' };
    var accessToken = client.getAccessToken();
    // When the client is authenticated, the request token will be invalid
    equals(accessToken.key, '242968ea69f7cbc46c7c3abf3de7634c', "get access key");
    equals(accessToken.secret, '9858f453d21ab6e0', "get access secret");
    equals(client.userId, '2133418', "get username");
});

test("test programmatic login", function() {
    var client = $.douban('client', { key: '1', secret: '2' });
    var accessToken = { key: '6fcf833aff0589883f6e89b0fd109c98', secret: 'b692646c5d1929ab' };
    var login = client.login(accessToken);
    ok(login, "login successful");
    ok(client.isAuthenticated(), "access is authenticated");
});

test("test auth headers", function() {
    var client = $.douban('client', { key: '1', secret: '2' });
    var headers = client.getAuthHeaders('http://api.douban.com/people/1000001', 'GET', { 'alt': 'json' });
    ok(headers, "get headers ( \"" + headers + "\" )");
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

test("test user api", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    // get user profile
    var ahbei = service.user.get('ahbei');
    equals(ahbei.id, "http://api.douban.com/people/1000001", "get user id ok");
    equals(ahbei.userName, "ahbei", "get user name ok");
    equals(ahbei.screenName, "阿北", "get screen name ok");
    equals(ahbei.location, "北京", "get location ok");
    equals(ahbei.blog, "http://ahbei.com/", "get blog ok");
    equals(ahbei.intro, "豆瓣的临时总管。现在多数时间在忙忙碌碌地为豆瓣添砖加瓦。坐在马桶上看书，算是一天中最放松的时间。\r\n\r\n我不但喜欢读书、旅行和音乐电影，还曾经是一个乐此不疲的实践者，有一墙碟、两墙书、三大洲的车船票为记。现在自己游荡差不多够了，开始懂得分享和回馈。豆瓣是一个开始，希望它对你同样有用。\r\n\r\n(我的朋友邀请原则：一般是线下朋友，见过不只一次面。谢谢“关注” )。\r\n", "get introduction ok");
    equals(ahbei.url, "http://www.douban.com/people/ahbei/", "get user url ok");
    equals(ahbei.imageUrl, "http://otho.douban.com/icon/u1000001-14.jpg", "get user icon url ok");

    // get user's friends
    var friends = service.user.friends('wyt', 7, 4);
    ok(friends.total > 72, "get user's total friends ok");
    equals(friends.entries.length, 4, "get user's friends ok");

    // get user's contacts
    var contacts = service.user.contacts('wyt', 2, 5);
    ok(contacts.total > 111);
    equals(contacts.entries.length, 5, "get user's contacts ok");

    // get current authenticated user
    var me = service.user.current();
    equals(me.id, "http://api.douban.com/people/2133418", "get current user name ok");
    equals(me.userName, "iloveshutuo", "get current user id ok");

    // search people
    var result = service.user.search('ke', 6, 3);
    equals(result.total, 49, "search people total results ok");
    equals(result.offset, 6, "search people start index ok");
    equals(result.limit, 3, "search people max results ok");
    equals(result.entries.length, 3, "search people ok");
    equals(result.entries[0].id, "http://api.douban.com/people/1110946", "get user id ok");
    equals(result.entries[1].id, "http://api.douban.com/people/1652131", "get user id ok");
    equals(result.entries[2].id, "http://api.douban.com/people/1280023", "get user id ok");
});

test("test note api", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    // get note by id
    var note = service.note.get('21700087');
    var date1 = new Date(2008, 10, 18, 01, 48, 21);
    var date2 = new Date(2008, 10, 18, 02, 04, 50);
    equals(note.id, "http://api.douban.com/note/21700087", "get note id ok");
    equals(note.title, "Robin的“SNS之我见系列”得再推荐一次", "get note title ok");
    equals(note.author.id, "http://api.douban.com/people/1204682", "get author id ok");
    equals(note.author.screenName, "Jaxx", "get author name ok");
    equals(note.summary, "Facebook的成功秘诀是什么 - SNS之我见（一）  点评国内Facebook克隆网站 - SNS之我见（二）  社区网站SNS化的思考 – SNS之我见（三）  什么样的社区能够成为集大成者？- SNS之我见（四）  珍爱创业，远离SNS - SNS之我见（五）  SNS的工具化思考 - SNS之我见（六）  SNS的路径选择问题思考  ", "get note summary ok");
    equals(note.content, "Facebook的成功秘诀是什么 - SNS之我见（一）  点评国内Facebook克隆网站 - SNS之我见（二）  社区网站SNS化的思考 – SNS之我见（三）  什么样的社区能够成为集大成者？- SNS之我见（四）  珍爱创业，远离SNS - SNS之我见（五）  SNS的工具化思考 - SNS之我见（六）  SNS的路径选择问题思考  ", "get note content ok");
    equals(note.published.getTime(), date1.getTime(), "get note published time ok");
    equals(note.updated.getTime(), date2.getTime(), "get note updated time ok");
    equals(note.url, "http://www.douban.com/note/21700087/", "get note url ok");
    equals(note.isPublic, true, "check if note is public ok");
    equals(note.isReplyEnabled, true, "check if is able to reply ok");

    // get note by api url
    // var note2 = service.note.get('http://api.douban.com/note/18209070');
    // equals(note.title, 'Facebook终于也life-streaming化了', "get title of note ok");

    // get notes of user by user id
    var notes = service.note.getForUser('NullPointer', 4, 2);
    equals(notes.total, 0, "douban does not return total number of notes");
    equals(notes.offset, 4, "get notes of np start index ok");
    equals(notes.limit, 2, "get notes of np max results ok");
    equals(notes.entries.length, 2, "get notes of np ok");
    ok(notes.entries[0].id.match(/http:\/\/api\.douban\.com\/note\/\d+/), "get note id ok");
    var user = notes.author;
    equals(user.screenName, "NullPointer", "get author of notes ok");

    // get notes by user object
    var notes2 = service.note.getForUser(user, 2, 1);
    // equals(notes2.total, 10, "get notes of wyt total results ok");
    ok(notes2.entries[0].id.match(/http:\/\/api\.douban\.com\/note\/\d+/), "get note id ok");

    // publish a new note
    var note3 = service.note.add({ title: "功能多不如MM多", content: "没错，当时就是这样"});
    ok(note3.id.match(/http:\/\/api\.douban\.com\/note\/\d+/), "get id of note ok");
    equals(note3.title, '功能多不如MM多', "get title of note ok");
    equals(note3.content, '没错，当时就是这样', "get title of note ok");

    // update the note
    var note4 = service.note.update(note3, { title: "功能多不如DD多", content: "错了，当时不是这样的" });
    equals(note4.id, note3.id, "get id of note ok");
    equals(note4.title, '功能多不如DD多', "get title of note ok");
    equals(note4.content, '错了，当时不是这样的', "get title of note ok");

    // remove the note
    var response = service.note.remove(note4);
    ok(response, "note removed");
});

test("test book api", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    var book = service.book.get('1493316');
    equals(book.id, 'http://api.douban.com/book/subject/1493316');
    equals(book.title, '交互设计之路');
    equals(book.aka[0], 'The Inmates Are Running the Asylum : Why High Tech Products Drive Us Crazy and How to Restore the Sanity');
    
    var result = service.book.search('mysql', 5, 2);
    ok(result.total >= 100, "search book total results ok" + result.total);
    equals(result.offset, 5, "search book start index ok");
    equals(result.limit, 2, "search book max results ok");
    equals(result.entries.length, 2, "search book ok");
    ok(result.entries[0].id.match(/^http:\/\/api\.douban\.com\/book\/subject\/\d+$/), "get book id ok: " + result.entries[0].id);
});

/* Because all sujects are inherited from same class,
 * it's ok to test only one of them
test("test movie api", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    var movie = service.movie.get('1789283');
    equals(movie.id, 'http://api.douban.com/movie/subject/1789283');
    equals(movie.title, 'Déjà Vu');
    equals(movie.chineseTitle, '超时空效应');
    equals(movie.aka.length, 6);
    
    var result = service.movie.search('lord', 9, 3);
    equals(result.query, 'lord');
    equals(result.total, 44, "search movie total results ok");
    equals(result.offset, 9, "search movie start index ok");
    equals(result.limit, 3, "search movie max results ok");
    equals(result.entries.length, 3, "search movie ok");
    equals(result.entries[0].id, "http://api.douban.com/movie/subject/1485417", "get movie id ok");
    equals(result.entries[1].id, "http://api.douban.com/movie/subject/1479800", "get movie id ok");
    equals(result.entries[2].id, "http://api.douban.com/movie/subject/1306388", "get movie id ok");
});

test("test music api", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    var music = service.music.get('http://api.douban.com/music/subject/3040677');
    equals(music.id, 'http://api.douban.com/music/subject/3040677');
    equals(music.title, 'hello');
    equals(music.aka.length, 0);
    
    var result = service.music.search('unplugged', 12, 3);
    equals(result.total, 26, "search music total results ok");
    equals(result.offset, 12, "search music start index ok");
    equals(result.limit, 3, "search music max results ok");
    equals(result.entries.length, 3, "search music ok");
});
*/

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

/* Only ``getForUser`` should be tested
 */
test("test collection api", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    /* get collection by id
    var collection = service.collection.get('21701587');
    var date = new Date(2007, 09, 09, 23, 03, 42);
    equals(collection.id, "http://api.douban.com/collection/21701587", "get collection id ok");
    equals(collection.title, "青年|Andy 读过 东方快车谋杀案", "get collection title ok");
    equals(collection.owner.id, "http://api.douban.com/people/1309094", "get owner id ok");
    equals(collection.owner.screenName, "青年|Andy", "get owner name ok");
    equals(collection.subject.id, "http://api.douban.com/book/subject/1731370");
    equals(collection.subject.title, "东方快车谋杀案");
    equals(collection.updated.getTime(), date.getTime(), "get collection updated time ok");
     */

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
    var collections2 = service.collection.getForUser('wyt', 4, 2, 'book');
    ok(collections2.total >= 494);
    ok(collections2.entries[0].id.match(/http:\/\/api\.douban\.com\/collection\/\d+/), "get collection id ok");
     */

    /* add a new collection
    var collection3 = service.collection.add({ subject: collection.subject, content: "没错，当时就是这样", tags: ['东方', '谋杀', '小说'], status: 'read' });
    ok(collection3.id.match(/http:\/\/api\.douban\.com\/collection\/\d+/), "get id of collection ok");
    equals(collection3.title, 'ilovest 读过 东方快车谋杀案', "get title of collection ok");
    equals(collection3.content, '没错，当时就是这样');
    equals(collection3.tags.length, 3, "get length of tags ok");
     */

    /* update the collection
    var collection4 = service.collection.update(collection3, { status: 'wish', content: "错了，当时不是这样的" });
    ok(collection4.id.match(/http:\/\/api\.douban\.com\/collection\/\d+/), "get id of collection ok");
    equals(collection4.title, "ilovest 想读 东方快车谋杀案", "get title of collection ok");
    equals(collection4.content, '错了，当时不是这样的', "get content of collection ok");
     */

    /* remove the collection
    var response = service.collection.remove(collection4);
    ok(response , "collection removed");
     */
});

/* Only ``getForContacts`` should be tested
 */
test("test miniblog api", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    /* get miniblog for user
    miniblogs = service.miniblog.getForUser('wyt', 10, 10);
    equals(miniblogs.offset, 10);
    ok(miniblogs.entries[9].id.match(/http:\/\/api\.douban\.com\/miniblog\/\d+/), "get miniblog id");
     */

    /* get miniblog for contacts
     */
    miniblogs2 = service.miniblog.getForContacts('iloveshutuo', 9, 9);
    equals(miniblogs2.limit, 9);
    ok(miniblogs2.entries[5].id.match(/http:\/\/api\.douban\.com\/miniblog\/\d+/), "get miniblog id");

    /* add miniblog
    miniblog = service.miniblog.add({ content: '真是的，这是什么啊' });
    equals(miniblog.content, '真是的，这是什么啊');
     */

    /* remove miniblog
    var response = service.miniblog.remove(miniblog);
    ok(response, "miniblog removed");
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
    ok(eventos.total > 1, "get total ok: " + eventos.total);
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

test("test user object", function() {
    var json = {"content":{"$t":""},"db:uid":{"$t":"whoami"},"link":[{"@rel":"self","@href":"http://api.douban.com/people/2139418"},{"@rel":"alternate","@href":"http://www.douban.com/people/whoami/"},{"@rel":"icon","@href":"http://otho.douban.com/icon/u2139418-1.jpg"}],"id":{"$t":"http://api.douban.com/people/2139418"},"title":{"$t":"我是谁"}};
    var user = $.douban('user', json);
    equals(user.id, "http://api.douban.com/people/2139418", "get user id ok");
    equals(user.userName, "whoami", "get user name ok");
    equals(user.screenName, "我是谁", "get screen name ok");
    equals(user.location, undefined, "get user location ok");
    equals(user.blog, undefined, "get user blog ok");
    equals(user.intro, '', "get user introduction ok");
    equals(user.url, "http://www.douban.com/people/whoami/", "get user homepage ok");
    equals(user.imageUrl, "http://otho.douban.com/icon/u2139418-1.jpg", "get user icon url ok");

    var user2 = $.douban('user');
    equals(user2.id, undefined);
    equals(user2.userName, undefined);
    equals(user2.location, undefined);
    equals(user2.blog, undefined);
    equals(user2.intro, undefined);
    equals(user2.url, undefined);
    equals(user2.imageUrl, undefined);
});

test("test note object", function() {
    var json = {"updated":{"$t":"2008-04-30T10:48:04+08:00"},"author":{"link":[{"@rel":"self","@href":"http://api.douban.com/people/1139389"},{"@rel":"alternate","@href":"http://www.douban.com/people/wyt/"},{"@rel":"icon","@href":"http://otho.douban.com/icon/u1139389-21.jpg"}],"uri":{"$t":"http://api.douban.com/people/1139389"},"name":{"$t":"wu yuntao"}},"title":{"$t":"纪念一下"},"summary":{"$t":"这是摘要"},"content":{"$t":"这是全文"},"link":[{"@rel":"self","@href":"http://api.douban.com/note/10671354"},{"@rel":"alternate","@href":"http://www.douban.com/note/10671354/"}],"published":{"$t":"2008-04-29T10:38:04+08:00"},"db:attribute":[{"$t":"public","@name":"privacy"},{"$t":"yes","@name":"can_reply"}],"id":{"$t":"http://api.douban.com/note/10671354"}};

    var note = $.douban('note', json);
    var date1 = new Date(2008, 03, 29, 10, 38, 04);
    var date2 = new Date(2008, 03, 30, 10, 48, 04);
    equals(note.id, "http://api.douban.com/note/10671354", "get note id ok");
    equals(note.title, "纪念一下", "get note title ok");
    equals(note.author.id, "http://api.douban.com/people/1139389", "get author id ok");
    equals(note.author.screenName, "wu yuntao", "get author name ok");
    equals(note.summary, "这是摘要", "get note summary ok");
    equals(note.content, "这是全文", "get note content ok");
    equals(note.published.getTime(), date1.getTime(), "get note published time ok");
    equals(note.updated.getTime(), date2.getTime(), "get note updated time ok");
    equals(note.url, "http://www.douban.com/note/10671354/", "get note url ok");
    equals(note.isPublic, true, "check if note is public ok");
    equals(note.isReplyEnabled, true, "check if is able to reply ok");

    var note2 = $.douban('note');
    equals(note2.id, undefined);
    equals(note2.title, undefined);
    equals(note2.author, undefined);
    equals(note2.summary, undefined);
    equals(note2.content, undefined);
    equals(note2.published, undefined);

    // create xml
    var xml = $.douban.createXml('note', { title: "标题", content: "内容", isPublic: true, isReplyEnabled: false });
    equals(xml, '<?xml version="1.0" encoding="UTF-8"?><entry xmlns="http://www.w3.org/2005/Atom" xmlns:db="http://www.douban.com/xmlns/"><title>标题</title><content>内容</content><db:attribute name="privacy">public</db:attribute><db:attribute name="can_reply">no</db:attribute></entry>', "get xml ok");
});

test("test book object", function() {
    var json = {"category":{"@scheme":"http://www.douban.com/2007#kind","@term":"http://www.douban.com/2007#book"},"db:tag":[{"@count":1,"@name":"日本"},{"@count":1,"@name":"轻小说"}],"title":{"$t":"とある魔術の禁書目録(インデックス) (電撃文庫)"},"author":[{"name":{"$t":"鎌池 和馬"}},{"name":{"$t":"灰村 キヨタカ"}}],"summary":{"$t":"登場!"},"link":[{"@rel":"self","@href":"http://api.douban.com/book/subject/3137911"},{"@rel":"alternate","@href":"http://www.douban.com/subject/3137911/"},{"@rel":"image","@href":"http://otho.douban.com/spic/s3168047.jpg"}],"db:attribute":[{"$t":"484022658X","@name":"isbn10"},{"$t":"9784840226585","@name":"isbn13"},{"$t":"とある魔術の禁書目録(インデックス) (電撃文庫)","@name":"title"},{"$t":"297","@name":"pages"},{"$t":"鎌池 和馬","@name":"author"},{"$t":"灰村 キヨタカ","@name":"author"},{"$t":"JPY 5.99","@name":"price"},{"$t":"メディアワークス","@name":"publisher"},{"$t":"文庫","@name":"binding"},{"$t":"2004-04","@name":"pubdate"}],"id":{"$t":"http://api.douban.com/book/subject/3137911"},"gd:rating":{"@min":1,"@numRaters":2,"@average":"3.00","@max":5}};

    var book = $.douban('book', json);
    equals(book.id, "http://api.douban.com/book/subject/3137911");
    equals(book.title, "とある魔術の禁書目録(インデックス) (電撃文庫)");
    equals(book.authors.length, 2);
    equals(book.authors[0], "鎌池 和馬");
    equals(book.authors[1], "灰村 キヨタカ");
    equals(book.translators.length, 0);
    equals(book.isbn10, "484022658X");
    equals(book.isbn13, "9784840226585");
    equals(book.publisher, "メディアワークス");
    equals(book.price, "JPY 5.99");
    equals(book.binding, "文庫");
    equals(book.releaseDate, "2004-04");
    equals(book.authorIntro, undefined);
    equals(book.url, "http://www.douban.com/subject/3137911/");
    equals(book.imageUrl, "http://otho.douban.com/spic/s3168047.jpg");
    equals(book.tags.length, 2);
    equals(book.tags[0].name, "日本");
    equals(book.tags[0].count, 1);
    equals(book.rating, 3.0);
    equals(book.votes, 2);
});

test("test movie object", function() {
    var json = {"category":{"@scheme":"http://www.douban.com/2007#kind","@term":"http://www.douban.com/2007#movie"},"db:tag":[{"@count":3425,"@name":"爱情"},{"@count":1654,"@name":"美国"},{"@count":1168,"@name":"Sunrise"},{"@count":986,"@name":"经典"},{"@count":917,"@name":"RichardLinklater"}],"title":{"$t":"Before Sunrise"},"author":[{"name":{"$t":"Richard Linklater"}}],"summary":{"$t":"简介"},"link":[{"@rel":"self","@href":"http://api.douban.com/movie/subject/1296339"},{"@rel":"alternate","@href":"http://www.douban.com/subject/1296339/"},{"@rel":"image","@href":"http://otho.douban.com/spic/s1401102.jpg"}],"db:attribute":[{"$t":"Before Sunrise","@name":"title"},{"$t":"奥地利","@name":"country"},{"$t":"瑞士","@name":"country"},{"$t":"美国","@name":"country"},{"$t":"Kim Krizan","@name":"writer"},{"$t":"Richard Linklater","@name":"writer"},{"$t":"1995","@name":"pubdate"},{"$t":"Richard Linklater","@name":"director"},{"$t":"英语","@name":"language"},{"$t":"http://www.imdb.com/title/tt0112471/","@name":"imdb"},{"@lang":"zh_CN","$t":"爱在黎明破晓前","@name":"aka"},{"$t":"Ethan Hawke","@name":"cast"},{"$t":"Julie Delpy","@name":"cast"},{"$t":"日出之前","@name":"aka"},{"$t":"情留半天","@name":"aka"},{"$t":"爱在黎明破晓前","@name":"aka"}],"id":{"$t":"http://api.douban.com/movie/subject/1296339"},"gd:rating":{"@min":1,"@numRaters":9988,"@average":"4.49","@max":5}}
    var movie = $.douban('movie', json);
    equals(movie.id, "http://api.douban.com/movie/subject/1296339");
    equals(movie.title, "Before Sunrise");
    equals(movie.chineseTitle, "爱在黎明破晓前");
    equals(movie.aka.length, 4);
    equals(movie.directors[0], "Richard Linklater");
    equals(movie.writers[0], "Kim Krizan");
    equals(movie.writers[1], "Richard Linklater");
    equals(movie.cast[0], "Ethan Hawke");
    equals(movie.cast[1], "Julie Delpy");
    equals(movie.imdb, "http://www.imdb.com/title/tt0112471/");
    equals(movie.episode, undefined);
    equals(movie.language[0], "英语");
    equals(movie.country.length, 3);
    equals(movie.summary, "简介");
    equals(movie.url, "http://www.douban.com/subject/1296339/");
    equals(movie.imageUrl, "http://otho.douban.com/spic/s1401102.jpg");
    equals(movie.tags.length, 5);
    equals(movie.rating, 4.49);
    equals(movie.votes, 9988);
});

test("test music object", function() {
    var json = {"category":{"@scheme":"http://www.douban.com/2007#kind","@term":"http://www.douban.com/2007#music"},"db:tag":[{"@count":57,"@name":"OST"},{"@count":50,"@name":"菅野よう子"},{"@count":23,"@name":"Macross"},{"@count":21,"@name":"Anime"},{"@count":18,"@name":"日本"}],"title":{"$t":"マクロスF O.S.T.2 『娘トラ。』"},"author":[{"name":{"$t":"シェリル・ノーム starrinng May'n"}},{"name":{"$t":"中島愛"}},{"name":{"$t":"菅野よう子"}}],"summary":{"$t":"简介"},"link":[{"@rel":"self","@href":"http://api.douban.com/music/subject/3204166"},{"@rel":"alternate","@href":"http://www.douban.com/subject/3204166/"},{"@rel":"image","@href":"http://otho.douban.com/spic/s3267369.jpg"}],"db:attribute":[{"$t":"1","@name":"discs"},{"$t":"4580226561722","@name":"ean"},{"$t":"01 Track","@name":"tracks"},{"$t":"2008-10-08","@name":"pubdate"},{"$t":"マクロスF O.S.T.2 『娘トラ。』","@name":"title"},{"$t":"シェリル・ノーム starrinng May'n","@name":"singer"},{"$t":"中島愛","@name":"singer"},{"$t":"菅野よう子","@name":"singer"},{"$t":"Soundtrack","@name":"version"},{"$t":"JVCエンタテインメント","@name":"publisher"},{"$t":"CD","@name":"media"},{"$t":"MACROSS F O.S.T.2 『NYAN TORA。』","@name":"aka"},{"$t":"超时空要塞F  O.S.T.2 『娘トラ。』","@name":"aka"}],"id":{"$t":"http://api.douban.com/music/subject/3204166"},"gd:rating":{"@min":1,"@numRaters":149,"@average":"4.56","@max":5}};
    var music = $.douban('music', json);
    equals(music.id, "http://api.douban.com/music/subject/3204166");
    equals(music.title, "マクロスF O.S.T.2 『娘トラ。』");
    equals(music.aka.length, 2);
    equals(music.artists[0], "シェリル・ノーム starrinng May'n");
    equals(music.artists[1], "中島愛");
    equals(music.artists[2], "菅野よう子");
    equals(music.ean, "4580226561722");
    equals(music.summary, "简介");
    equals(music.tags.length, 5);
    equals(music.rating, 4.56);
    equals(music.votes, 149);
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
