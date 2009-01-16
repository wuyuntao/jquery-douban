module("Douban Note Testcases");

test("test note api", function() {
    expect(25);
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

test("test note object", function() {
    expect(18);

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

// vim: foldmethod=indent
