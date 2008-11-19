test("test misc", function() {
    // super class
    var Person = $.class({
        init: function(name, sex) {
            this.name = name;
            this.sex = sex;
        },
        getName: function() {
            return this.name;
        },
        getSex: function() {
            return this.sex;
        }
    });
    // subclass inherited from ``Person``
    var Boy = $.class(Person, {
        init: function(name) {
            this.name = name;
            this.sex = 'male';
        }
    });
    var mike = new Boy('mike');
    equals(mike.getName(), 'mike');
    equals(mike.getSex(), 'male');
});

module("Basic Testcases");

test("test factory method", function() {
    var service = $.douban({ apiKey: '1', apiSecret: '2' });
    ok(service, "initialize douban service ok");
    equals(service.api.key, '1', "api key expected to be 1");
    equals(service.api.secret, '2', "api secret expected to be 2");
    equals(service.options.httpType, 'jquery', "http type expected to be \"jquery\"");

    var service2 = $.douban({ apiKey: '3', apiSecret: '4', httpType: 'gears' });
    ok(service2, "initialize douban service ok");
    equals(service2.api.key, '3', "api key expected to be 3");
    equals(service2.api.secret, '4', "api secret expected to be 4");
    equals(service2.options.httpType, 'gears', "http type expected to be \"gears\"");

    var client = $.douban('client', { apiKey: '5', apiSecret: '6' });
    ok(client, "initialize douban client ok");
    equals(client.api.key, '5', "api key expected to be 5");
    equals(client.api.secret, '6', "api secret expected to be 6");
    equals(client.options.httpType, 'jquery', "http type expected to be \"jquery\"");
});

module("HTTP Testcases");

test("test factory method", function() {
    equals($.douban.http.activeHandler.name, 'jquery', "default handler is 'jquyer'");
    $.douban.http.setActive('gears');
    equals($.douban.http.activeHandler.name, 'gears', "set handler to 'geas' ok");

    var request = $.douban.http.factory();
    equals(request.name, 'jquery', "initialize jquery http request handler ok");

    var request2 = $.douban.http.factory({ type: 'greasemonkey' });
    equals(request2.name, 'greasemonkey', "initialize greasemonkey http request handler ok");

    $.douban.http.setActive('jquery');
});

test("test jquery http methods", function() {
    // Privileges are granted only in the scope of the requesting function.
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
    var client = $.douban.client.factory({ apiKey: '1', apiSecret: '2' });
    equals(client.api.key, '1', "api key expected to be 1");
    equals(client.api.secret, '2', "api secret expected to be 2");
    equals(client.http.name, 'jquery', "http type expected to be \"jquery\"");
});

test("test authorization step 1: get request token", function() {
    netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");

    var client = $.douban.client.factory({ apiKey: '0107c5c3c9d4ecc40317514b5d7ec64c', apiSecret: '7feaf4ec7b6989f8' });
    var requestToken = client.getRequestToken();
    equals(requestToken.key.length, 32, "check the length of request key ( \"" + requestToken.key + "\" )");
    equals(requestToken.secret.length, 16, "check the length of request secret ( \"" + requestToken.secret + "\" )");
});

test("test authorization step 2: get authorization url", function() {
    var client = $.douban.client.factory({ apiKey: '1', apiSecret: '2' });
    var callback = 'mycallback';
    // Set request token manually
    client.requestToken = { key: '3', secret: '4' };

    var url = client.getAuthorizationUrl(callback);
    equals(url, 'http://www.douban.com/service/auth/authorize?oauth_token=3&oauth_callback=mycallback');

    var url2 = client.getAuthorizationUrl({ key: '5', secret: '6' }, callback);
    equals(url2, 'http://www.douban.com/service/auth/authorize?oauth_token=5&oauth_callback=mycallback');
});

test("test authorization step 3: get access token ", function() {
    netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");

    var client = $.douban.client.factory({ apiKey: '0107c5c3c9d4ecc40317514b5d7ec64c', apiSecret: '7feaf4ec7b6989f8' });
    client.requestToken = { key: 'ad6a4a13fb9b1ce7083ede3bf2d156b5',
                            secret: '6fb16ea234a309fd' };
    var accessToken = client.getAccessToken();
    // When the client is authenticated, the request token will be invalid
    equals(accessToken.key, '242968ea69f7cbc46c7c3abf3de7634c', "get access key");
    equals(accessToken.secret, '9858f453d21ab6e0', "get access secret");
    equals(client.userId, '2133418', "get username");
});

test("test programmatic login", function() {
    var client = $.douban.client.factory({ apiKey: '1', apiSecret: '2' });
    var accessToken = { key: '6fcf833aff0589883f6e89b0fd109c98', secret: 'b692646c5d1929ab' };
    var login = client.login(accessToken);
    ok(login, "login successful");
    ok(client.isAuthenticated(), "access is authenticated");
});

test("test auth headers", function() {
    var client = $.douban.client.factory({ apiKey: '1', apiSecret: '2' });
    var headers = client.getAuthHeaders('http://api.douban.com/people/1000001', 'GET', { 'alt': 'json' });
    ok(headers, "get headers ( \"" + headers + "\" )");
});

module("Douban Service Testcases");

test("test factory method", function() {
    var service = $.douban.service.factory({ apiKey: '1', apiSecret: '2' });
    equals(service.api.key, '1', "api key expected to be 1");
    equals(service.api.secret, '2', "api secret expected to be 2");
    equals(service.http.name, 'jquery', "http type expected to be \"jquery\"");
    ok(service.client, "client initialized");
});

test("test client login", function() {
    netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");

    var service = $.douban.service.factory({ apiKey: '0107c5c3c9d4ecc40317514b5d7ec64c', apiSecret: '7feaf4ec7b6989f8' });
    var accessToken = { key: '6fcf833aff0583884f6e89b0fd109c98', secret: 'b623646c5d1929ab' };
    var login = service.login(accessToken);
    ok(login, "login successful");
});

test("test user api", function() {
    netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");

    var service = $.douban.service.factory({ apiKey: '0107c5c3c9d4ecc40317514b5d7ec64c', apiSecret: '7feaf4ec7b6989f8' });
    service.login({ key: '242968ea69f7cbc46c7c3abf3de7634c', secret: '9858f453d21ab6e0' });

    // get user profile
    var ahbei = service.user.get('ahbei');
    equals(ahbei.id, "http://api.douban.com/people/1000001", "get user id ok");
    equals(ahbei.userName, "ahbei", "get user name ok");
    equals(ahbei.screenName, "阿北", "get screen name ok");
    equals(ahbei.location, "北京", "get location ok");
    equals(ahbei.blog, "http://ahbei.com/", "get blog ok");
    equals(ahbei.intro, "豆瓣的临时总管。现在多数时间在忙忙碌碌地为豆瓣添砖加瓦。坐在马桶上看书，算是一天中最放松的时间。\r\n\r\n我不但喜欢读书、旅行和音乐电影，还曾经是一个乐此不疲的实践者，有一墙碟、两墙书、三大洲的车船票为记。现在自己游荡差不多够了，开始懂得分享和回馈。豆瓣是一个开始，希望它对你同样有用。\r\n\r\n(我的朋友邀请原则：一般是线下朋友，见过不只一次面。谢谢“关注” )。\r\n", "get introduction ok");
    equals(ahbei.url, "http://www.douban.com/people/ahbei/", "get user url ok");
    equals(ahbei.iconUrl, "http://otho.douban.com/icon/u1000001-14.jpg", "get user icon url ok");

    // get user's friends
    var friends = service.user.friends('wyt', 7, 4);
    equals(friends.total, 72);
    equals(friends.entries.length, 4, "get user's friends ok");

    // get user's contacts
    var contacts = service.user.contacts('wyt', 2, 5);
    equals(contacts.total, 111);
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
    equals(result.entries[0].id, "http://api.douban.com/people/1282010", "get user id ok");
    equals(result.entries[1].id, "http://api.douban.com/people/1110946", "get user id ok");
    equals(result.entries[2].id, "http://api.douban.com/people/1652131", "get user id ok");
});

test("test note api", function() {
    netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");

    var service = $.douban({ apiKey: '0107c5c3c9d4ecc40317514b5d7ec64c', apiSecret: '7feaf4ec7b6989f8' });
    service.login({ key: '242968ea69f7cbc46c7c3abf3de7634c', secret: '9858f453d21ab6e0' });

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
    equals(notes.entries[0].id, "http://api.douban.com/note/20178647", "get note id ok");
    var user = notes.author;
    equals(user.screenName, "NullPointer", "get author of notes ok");

    // get notes by user object
    var notes2 = service.note.getForUser(user, 2, 1);
    // equals(notes2.total, 10, "get notes of wyt total results ok");
    equals(notes2.entries[0].id, "http://api.douban.com/note/20573790", "get note id ok");

    // publish a new note
    var note3 = service.note.add("功能多不如MM多", "没错，当时就是这样");
    ok(note3.id.match(/http:\/\/api\.douban\.com\/note\/\d+/), "get id of note ok");
    equals(note3.title, '功能多不如MM多', "get title of note ok");
    equals(note3.content, '没错，当时就是这样', "get title of note ok");

    // update the note
    var note4 = service.note.update(note3, "功能多不如DD多", "错了，当时不是这样的");
    equals(note4.id, note3.id, "get id of note ok");
    equals(note4.title, '功能多不如DD多', "get title of note ok");
    equals(note4.content, '错了，当时不是这样的', "get title of note ok");

    // delete the note
    service.note.delete(note4);
    var note5 = service.note.get(note4);
    ok(!note5, "note deleted");
});

module("Douban Object Testcases");

test("test user object", function() {
    var json = {"content":{"$t":""},"db:uid":{"$t":"whoami"},"link":[{"@rel":"self","@href":"http://api.douban.com/people/2139418"},{"@rel":"alternate","@href":"http://www.douban.com/people/whoami/"},{"@rel":"icon","@href":"http://otho.douban.com/icon/u2139418-1.jpg"}],"id":{"$t":"http://api.douban.com/people/2139418"},"title":{"$t":"我是谁"}};
    var user = $.douban.user.factory(json);
    equals(user.id, "http://api.douban.com/people/2139418", "get user id ok");
    equals(user.userName, "whoami", "get user name ok");
    equals(user.screenName, "我是谁", "get screen name ok");
    equals(user.location, "", "get user location ok");
    equals(user.blog, "", "get user blog ok");
    equals(user.intro, "", "get user introduction ok");
    equals(user.url, "http://www.douban.com/people/whoami/", "get user homepage ok");
    equals(user.iconUrl, "http://otho.douban.com/icon/u2139418-1.jpg", "get user icon url ok");
});

test("test note object", function() {
    var json = {"updated":{"$t":"2008-04-30T10:48:04+08:00"},"author":{"link":[{"@rel":"self","@href":"http://api.douban.com/people/1139389"},{"@rel":"alternate","@href":"http://www.douban.com/people/wyt/"},{"@rel":"icon","@href":"http://otho.douban.com/icon/u1139389-21.jpg"}],"uri":{"$t":"http://api.douban.com/people/1139389"},"name":{"$t":"wu yuntao"}},"title":{"$t":"纪念一下"},"summary":{"$t":"这是摘要"},"content":{"$t":"这是全文"},"link":[{"@rel":"self","@href":"http://api.douban.com/note/10671354"},{"@rel":"alternate","@href":"http://www.douban.com/note/10671354/"}],"published":{"$t":"2008-04-29T10:38:04+08:00"},"db:attribute":[{"$t":"public","@name":"privacy"},{"$t":"yes","@name":"can_reply"}],"id":{"$t":"http://api.douban.com/note/10671354"}};

    var note = $.douban.note.factory(json);
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

    // create xml
    var xml = $.douban.note.createXml("标题", "内容", true, false);
    equals(xml, '<?xml version="1.0" encoding="UTF-8"?><entry xmlns="http://www.w3.org/2005/Atom" xmlns:db="http://www.douban.com/xmlns/"><title>标题</title><content>内容</content><db:attribute name="privacy">public</db:attribute><db:attribute name="can_reply">no</db:attribute></entry>', "get xml ok");
});

// vim: foldmethod=indent
