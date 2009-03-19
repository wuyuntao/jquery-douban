module("豆瓣日记 API 测试");

test("测试获取日记", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    stop();
    service.note.get('21700087', function(note) {
        console.debug(note);
        equals(note.id, "http://api.douban.com/note/21700087",
               "get note id ok");
        equals(note.title, "Robin的“SNS之我见系列”得再推荐一次",
               "get note title ok");
        equals(note.author.id, "http://api.douban.com/people/1204682",
               "get author id ok");
        equals(note.author.name, "Jaxx", "get author name ok");
        equals(note.summary, "Facebook的成功秘诀是什么 - SNS之我见（一）  点评国内Facebook克隆网站 - SNS之我见（二）  社区网站SNS化的思考 – SNS之我见（三）  什么样的社区能够成为集大成者？- SNS之我见（四）  珍爱创业，远离SNS - SNS之我见（五）  SNS的工具化思考 - SNS之我见（六）  SNS的路径选择问题思考  ", "get note summary ok");
        equals(note.content, "Facebook的成功秘诀是什么 - SNS之我见（一）  点评国内Facebook克隆网站 - SNS之我见（二）  社区网站SNS化的思考 – SNS之我见（三）  什么样的社区能够成为集大成者？- SNS之我见（四）  珍爱创业，远离SNS - SNS之我见（五）  SNS的工具化思考 - SNS之我见（六）  SNS的路径选择问题思考  ", "get note content ok");
        equals(note.published, "2008-11-18T01:48:21+08:00", "get note published time ok");
        equals(note.updated, "2008-11-18T02:04:50+08:00", "get note updated time ok");
        equals(note.link.home, "http://www.douban.com/note/21700087/",
               "get note url ok");
        equals(note.isPublic, true, "check if note is public ok");
        equals(note.isReplyEnabled, true, "check if is able to reply ok");
        start();
    });
});

test("获取用户日记", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    stop();
    service.note.getForUser('NullPointer', 4, 2, function(notes) {
        console.debug(notes);
        equals(notes.total, 0, "douban does not return total number of notes");
        equals(notes.offset, 4, "get notes of np start index ok");
        equals(notes.limit, 2, "get notes of np max results ok");
        equals(notes.entry.length, 2, "get notes of np ok");
        ok(notes.entry[0].id.match(/http:\/\/api\.douban\.com\/note\/\d+/), "get note id ok");
        equals(notes.author.name, "NullPointer", "get author of notes ok");
        start();
    });
});

test("测试添加日记", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    stop();
    service.note.add({
        title: "功能多不如MM多",
        content: "没错，当时就是这样" }, function(note) {
        console.debug(note);
        ok(note.id.match(/http:\/\/api\.douban\.com\/note\/\d+/),
           "get id of note ok");
        equals(note.title, '功能多不如MM多', "get title of note ok");
        equals(note.content, '没错，当时就是这样', "get title of note ok");
        start();
    });
});

test("测试更新日记", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    stop();
    service.note.update('29161439', {
        title: "功能多不如DD多",
        content: "错了，当时不是这样的" }, function(note) {
        console.debug(note);
        equals(note.title, '功能多不如DD多', "get title of note ok");
        equals(note.content, '错了，当时不是这样的', "get title of note ok");
        start();
    });
});

test("测试删除日记", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    /*
    stop();
    service.note.remove('29161336', function(response) {
    ok(response, "note removed");
        start();
    });
    */
});

test("测试生成日记 XML", function() {
    var xml = Douban.note.createXML({
        title: "标题",
        content: "内容",
        isPublic: true,
        isReplyEnabled: false
    });

    equals(xml, '<?xml version="1.0" encoding="UTF-8"?><entry xmlns="http://www.w3.org/2005/Atom" xmlns:db="http://www.douban.com/xmlns/"><title>标题</title><content>内容</content><db:attribute name="privacy">public</db:attribute><db:attribute name="can_reply">no</db:attribute></entry>', "get xml ok");
});
