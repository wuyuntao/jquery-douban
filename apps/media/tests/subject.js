module("Douban Book Testcases");

test("test book api", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    // Get book by subject ID
    var book = service.book.get('1493316');
    equals(book.id, 'http://api.douban.com/book/subject/1493316');
    equals(book.title, '交互设计之路');
    equals(book.aka[0], 'The Inmates Are Running the Asylum : Why High Tech Products Drive Us Crazy and How to Restore the Sanity');

    // Get book by ISBN
    var book2 = service.book.isbn('9787560069999');
    equals(book2.id, 'http://api.douban.com/book/subject/2326578');
    equals(book2.title, '通过漫画学日语（生活篇）');
    
    // Seach book
    var result = service.book.search('mysql', 5, 2);
    ok(result.total >= 100, "search book total results ok" + result.total);
    equals(result.offset, 5, "search book start index ok");
    equals(result.limit, 2, "search book max results ok");
    equals(result.entries.length, 2, "search book ok");
    ok(result.entries[0].id.match(/^http:\/\/api\.douban\.com\/book\/subject\/\d+$/), "get book id ok: " + result.entries[0].id);
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

module("Douban Movie Testcases");

/* Because all sujects are inherited from same class,
 * it's also ok to test only one of them
*/
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
    ok(result.total > 0, "search movie total results ok: " + result.total);
    equals(result.offset, 9, "search movie start index ok");
    equals(result.limit, 3, "search movie max results ok");
    equals(result.entries.length, 3, "search movie ok");

    var pattern = /^http:\/\/api\.douban\.com\/movie\/subject\/\d+$/;
    ok(result.entries[0].id.match(pattern), "get movie id ok: " + result.entries[0].id);
    ok(result.entries[0].id.match(pattern), "get movie id ok: " + result.entries[0].id);
    ok(result.entries[0].id.match(pattern), "get movie id ok: " + result.entries[0].id);
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

module("Douban Music Testcases");

test("test music api", function() {
    if (typeof netscape != 'undefined')
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    var service = createService();

    var music = service.music.get('http://api.douban.com/music/subject/3040677');
    equals(music.id, 'http://api.douban.com/music/subject/3040677');
    equals(music.title, 'hello');
    equals(music.aka.length, 0);
    
    var result = service.music.search('unplugged', 12, 3);
    ok(result.total > 0, "search music total results ok: " + result.total);
    equals(result.offset, 12, "search music start index ok");
    equals(result.limit, 3, "search music max results ok");
    equals(result.entries.length, 3, "search music ok");
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

// vim: foldmethod=indent
