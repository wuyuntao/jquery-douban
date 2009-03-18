module("图书 API 测试");

test("测试获取图书信息", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    stop();
    service.book.get('1493316', function(book) {
        console.debug(book);
        equals(book.id, 'http://api.douban.com/book/subject/1493316');
        equals(book.title, '交互设计之路');
        equals(book.aka[0], 'The Inmates Are Running the Asylum : Why High Tech Products Drive Us Crazy and How to Restore the Sanity');
        start();
    });
});

test("测试用 ISBN 获取图书信息", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    stop();
    service.book.isbn('9787560069999', function(book) {
        console.debug(book);
        equals(book.id, 'http://api.douban.com/book/subject/2326578');
        equals(book.title, '通过漫画学日语(生活篇)');
        start();
    });
});

test("测试搜索图书", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();
    var re = /^http:\/\/api\.douban\.com\/book\/subject\/\d+$/;

    stop();
    service.book.search('mysql', 5, 2, function(result) {
        console.debug(result);
        ok(result.total >= 100, "search book total results ok" + result.total);
        equals(result.offset, 5, "search book start index ok");
        equals(result.limit, 2, "search book max results ok");
        equals(result.entry.length, 2, "search book ok");
        ok(result.entry[0].id.match(re),
           "get book id ok: " + result.entry[0].id);
        start();
    }, { 'tag': 'php' });
});

module("电影 API 测试");

test("测试获取电影信息", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    stop();
    service.movie.get('1789283', function(movie) {
        console.debug(movie);
        equals(movie.id, 'http://api.douban.com/movie/subject/1789283');
        equals(movie.title, 'Déjà Vu');
        equals(movie.chineseTitle, '超时空效应');
        equals(movie.aka.length, 6);
        start();
    });
});

test("测试用 IMDB 编号获取电影信息", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    stop();
    service.movie.imdb('tt1386581', function(movie) {
        console.debug(movie);
        equals(movie.title, '涼宮ハルヒちゃんの憂鬱');
        equals(movie.chineseTitle, '小凉宫春日的忧郁');
        start();
    });
});
    
test("测试搜索电影", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();
    var re = /^http:\/\/api\.douban\.com\/movie\/subject\/\d+$/;

    stop();
    service.movie.search('lord', 9, 3, function(result) {
        console.debug(result);
        ok(result.total > 0, "search movie total results ok: " + result.total);
        equals(result.offset, 9, "search movie start index ok");
        equals(result.limit, 3, "search movie max results ok");
        equals(result.entry.length, 3, "search movie ok");
        ok(result.entry[0].id.match(re),
           "get movie id ok: " + result.entry[0].id);
        start();
    });
});

module("音乐 API 测试");

test("测试获取唱片信息", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    stop();
    service.music.get('http://api.douban.com/music/subject/3040677', function(music) {
        console.debug(music);
        equals(music.id, 'http://api.douban.com/music/subject/3040677');
        equals(music.title, 'hello');
        start();
    });
});

    
test("测试搜索音乐", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    stop();
    service.music.search('unplugged', 12, 3, function(result) {
        console.debug(result);
        ok(result.total > 0, "search music total results ok: " + result.total);
        equals(result.offset, 12, "search music start index ok");
        equals(result.limit, 3, "search music max results ok");
        equals(result.entry.length, 3, "search music ok");
        start();
    });
});
