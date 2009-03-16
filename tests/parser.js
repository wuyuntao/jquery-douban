// {{{ Single user
var u1 = Douban.user(user_1);
console.debug(u1);
fireunit.compare('http:\/\/api.douban.com\/people\/1867466', u1.id, "用户ID");
fireunit.compare('eugne', u1.uid, "用户名");
fireunit.compare('广东汕头', u1.location, "居住城市");
fireunit.compare('尋找阿波羅', u1.name, "用户昵称");
fireunit.compare('Be your personal best!', u1.intro, "用户简介");
fireunit.compare('http:\/\/www.douban.com\/people\/eugne\/', u1.link.home, "豆瓣主页");
fireunit.compare('http:\/\/otho.douban.com\/icon\/u1867466-3.jpg', u1.link.image, "用户头像");
fireunit.compare('http:\/\/i.cn.yahoo.com\/ital2457', u1.link.blog, "用户网志");

var u2 = Douban.user(user_2);
console.debug(u2);
fireunit.compare('http:\/\/api.douban.com\/people\/1095914', u2.id, "用户ID");
fireunit.compare('womanwendy', u2.uid, "用户名");
fireunit.compare(undefined, u2.location, "居住城市");
fireunit.compare('青猫', u2.name, "用户昵称");
fireunit.compare('凌厉\/简单\/天蝎B', u2.intro, "用户简介");
fireunit.compare('http:\/\/www.douban.com\/people\/womanwendy\/', u2.link.home, "豆瓣主页");
fireunit.compare('http:\/\/otho.douban.com\/icon\/u1095914-399.jpg', u2.link.image, "用户头像");
fireunit.compare(undefined, u2.link.blog, "用户网志");
// }}}

// {{{ User entry
var ue1 = Douban.user(user_entry_1);
console.debug(ue1);
fireunit.compare(269, ue1.total, "输出的用户总数");
fireunit.compare(5, ue1.limit, "输出的单页数量");
fireunit.compare(2, ue1.offset, "输出的偏移量");

var u3 = ue1.entry[3];
console.debug(u3);
fireunit.compare('http:\/\/api.douban.com\/people\/1160208', u3.id, "用户ID");
fireunit.compare('gukejian', u3.uid, "用户名");
fireunit.compare('Ávila, Spain', u3.location, "居住城市");
fireunit.compare('Alfred古柯碱', u3.name, "用户昵称");
fireunit.compare('【打开心门全是爱】', u3.intro, "用户简介");
fireunit.compare('http:\/\/www.douban.com\/people\/gukejian\/', u3.link.home, "豆瓣主页");
fireunit.compare('http:\/\/otho.douban.com\/icon\/u1160208-9.jpg', u3.link.image, "用户头像");
fireunit.compare(undefined, u3.link.blog, "用户网志");
// }}}

// {{{ Single book
var b1 = Douban.book(book_1);
console.debug(b1);
fireunit.compare("とある魔術の禁書目録(インデックス) (電撃文庫)", b1.title, "书名");
fireunit.compare("鎌池 和馬", b1.author[0], "第一作者");
fireunit.compare("灰村 キヨタカ", b1.author[1], "第二作者");
fireunit.compare("登場!", b1.summary, "简介");
fireunit.compare('http://www.douban.com/subject/3137911/', b1.link.home, "豆瓣主页");
fireunit.compare('http://otho.douban.com/spic/s3168047.jpg', b1.link.image, "用户头像");
fireunit.compare("484022658X", b1.isbn10, "ISBN10");
fireunit.compare("9784840226585", b1.isbn13, "ISBN13");
fireunit.compare("メディアワークス", b1.publisher, "出版社");
fireunit.compare("2004-04", b1.releaseDate, "出版年");
fireunit.compare("297", b1.pages, "页数");
fireunit.compare("JPY 5.99", b1.price, "页数");
fireunit.compare("文庫", b1.binding, "装帧");
fireunit.compare(1, b1.rating.min, "评分最小值");
fireunit.compare(5, b1.rating.max, "评分最大值");
fireunit.compare(2, b1.rating.votes, "投票人数");
fireunit.compare(3.0, b1.rating.average, "平均得分");
fireunit.compare(2, b1.tag.length, "标签总数");
fireunit.compare("日本", b1.tag[0].name, "标签名");
fireunit.compare(1, b1.tag[0].count, "标签标记数");
// }}}

// {{{ Single movie
var m1 = Douban.movie(movie_1);
console.debug(m1);
fireunit.compare("http://api.douban.com/movie/subject/1296339", m1.id, "电影ID");
fireunit.compare("Before Sunrise", m1.title, "电影名");
fireunit.compare("爱在黎明破晓前", m1.chineseTitle, "电影中文名");
fireunit.compare(4, m1.aka.length, "电影又名个数");
fireunit.compare("Richard Linklater", m1.director[0], "电影导演");
fireunit.compare("Kim Krizan", m1.writer[0], "第一编剧");
fireunit.compare("Richard Linklater", m1.writer[1], "第二编剧");
fireunit.compare("Ethan Hawke", m1.cast[0], "第一演员");
fireunit.compare("Julie Delpy", m1.cast[1], "第二演员");
fireunit.compare("http://www.imdb.com/title/tt0112471/", m1.imdb, "IMDB");
fireunit.compare(undefined, m1.episode, "集数");
fireunit.compare("英语", m1.language[0], "第一语言");
fireunit.compare(3, m1.country.length, "播出国家数");
fireunit.compare("简介", m1.summary, "简介");
fireunit.compare("http://www.douban.com/subject/1296339/", m1.link.home, "豆瓣主页");
fireunit.compare("http://otho.douban.com/spic/s1401102.jpg", m1.link.image, "电影海报");
fireunit.compare(5, m1.tag.length, "标签个数");
fireunit.compare(4.49, m1.rating.average, "平均分");
fireunit.compare(9988, m1.rating.votes, "投票人数");
// }}}

// {{{ Single music
var m2 = Douban.music(music_1);
console.debug(m2);
fireunit.compare("http://api.douban.com/music/subject/3204166", m2.id, "唱片ID");
fireunit.compare("マクロスF O.S.T.2 『娘トラ。』", m2.title, "唱片名");
fireunit.compare(2, m2.aka.length, "唱片又名");
fireunit.compare("シェリル・ノーム starrinng May'n", m2.artist[0], "第一歌手名");
fireunit.compare("中島愛", m2.artist[1], "第二歌手名");
fireunit.compare("菅野よう子", m2.artist[2], "第三歌手名");
fireunit.compare("4580226561722", m2.ean, "EAN");
fireunit.compare("简介", m2.summary, "简介");
fireunit.compare(m2.tag.length, 5, "标签个数");
fireunit.compare(m2.rating.average, 4.56, "平均分");
fireunit.compare(m2.rating.votes, 149, "投票人数");
// }}}

// {{{ Book entry
var be1 = Douban.book(book_entry_1);
console.debug(be1);
fireunit.compare("搜索 jquery 的结果", be1.title, "标题");
fireunit.compare(6, be1.total, "输出的用户总数");
fireunit.compare(3, be1.limit, "输出的单页数量");
fireunit.compare(2, be1.offset, "输出的偏移量");
// }}}

// {{{ Collection
var c1 = Douban.collection(collection_1);
console.debug(c1);
fireunit.compare("http://api.douban.com/collection/2165271", c1.id, "收藏ID");
fireunit.compare("http://api.douban.com/people/1025061", c1.owner.id, "收藏者ID");
fireunit.compare("http://api.douban.com/book/subject/1263907", c1.subject.id, "收藏条目ID");
fireunit.compare("wish", c1.status, "收藏状态");
fireunit.compare(0, c1.tag.length, "标签长度");
fireunit.compare("2006-03-30T00:10:03+08:00", c1.updated, "更新时间");
// }}}

// {{{ Collection entry
var ce1 = Douban.collection(collection_entry_1);
console.debug(ce1);

c2 = ce1.entry[1];
fireunit.compare(4, c2.rating.value, "收藏评分");
fireunit.compare("TimBurton", c2.tag[0].name, "收藏标签");
// }}}

// {{{ Review
var r1 = Douban.review(review_1);
console.debug(r1);
fireunit.compare("http://api.douban.com/review/1168468", r1.id, "评论ID");
fireunit.compare("好书", r1.title, "评论标题", "");
fireunit.compare("http://api.douban.com/people/1615529", r1.author.id, "评论者ID");
fireunit.compare("唐五", r1.author.name, "作者ID");
fireunit.compare("男人与男人之间的感情", r1.summary, "评论简介");
fireunit.compare("2007-06-16T14:21:06+08:00", r1.published, "评论发表时间");
fireunit.compare("2007-06-16T14:21:06+08:00", r1.updated, "评论最近更新时间");
fireunit.compare("http://www.douban.com/review/1168468/", r1.link.home, "豆瓣页面");
fireunit.compare(5, r1.rating.value, "评论评分");
fireunit.compare("http://api.douban.com/book/subject/1452923", r1.subject.id, "评论条目ID");
// }}}

// {{{ Review entry
var re1 = Douban.review(review_entry_1);
console.debug(re1);

var re2 = Douban.review(review_entry_2);
console.debug(re2);
fireunit.compare("http://api.douban.com/people/1091517", re2.author.id, "评论者ID");
// }}}

// {{{ Miniblog
var m1 = Douban.miniblog(miniblog_1);
console.debug(m1);
fireunit.compare("http://api.douban.com/miniblog/80210749", m1.id, "广播ID");
fireunit.compare("在看康熙卸妆那集，google广告提示“如何去掉脸上的豆豆，豆印”～～", m1.title, "广播标题");
fireunit.compare("在看康熙卸妆那集，google广告提示“如何去掉脸上的豆豆，豆印”～～", m1.content, "广播内容");
fireunit.compare("2008-11-20T20:43:25+08:00", m1.published, "广播发布时间");
fireunit.compare("saying", m1.category, "广播类别");
// }}}

// {{{ Miniblog entry
var me1 = Douban.miniblog(miniblog_entry_1);
console.debug(me1);
fireunit.compare("http://api.douban.com/people/1091517", me1.author.id, "用户ID");
fireunit.compare("小孙 的广播", me1.title, "广播entry标题");

var m2 = me1.entry[2];
fireunit.compare("想看Role Models", m2.title, "广播标题");
fireunit.compare("movie", m2.category, "广播类别");
fireunit.compare("collection", m2.subcategory, "广播子类别");
fireunit.compare("wish", m2.status, "收藏类别");
fireunit.compare("http://otho.douban.com/spic/s3375754.jpg", m2.link.image, "广播相关图片");
fireunit.compare("http://api.douban.com/movie/subject/2035075", m2.link.related, "广播相关链接");
// }}}

// {{{ Recommendation
var re1 = Douban.recommendation(recommendation_1);
console.debug(re1);
fireunit.compare('http://api.douban.com/recommendation/3673470', re1.id, "推荐ID");
fireunit.compare("推荐喵喵喵之小团子", re1.title, "推荐标题");
fireunit.compare("团子，我家团子，以前觉得她小时候很丑，现在觉得一点也不丑啊～哇哈哈哈", re1.comment, "推荐评论");
fireunit.compare("photo_album", re1.category, "推荐类别");
// }}}

// {{{ Recommendation comment entry
var ce2 = Douban.comment(comment_entry_1);
console.debug(ce2);

var c3 = ce2.entry[1];
fireunit.compare("你们两口子生生把个赵飞燕养成了杨玉环啊！", c3.content, "评论内容");
// }}}

// {{{ Note
var n1 = Douban.note(note_1);
console.debug(n1);
fireunit.compare("http://api.douban.com/note/10671354", n1.id, "日记ID");
fireunit.compare("纪念一下", n1.title, "日记标题");
fireunit.compare("http://api.douban.com/people/1139389", n1.author.id, "作者ID");
fireunit.compare("wu yuntao", n1.author.name, "作者名");
fireunit.compare("这是摘要", n1.summary, "摘要");
fireunit.compare("这是全文", n1.content, "全文");
fireunit.compare("2008-04-29T10:38:04+08:00", n1.published, "发布时间");
fireunit.compare("2008-04-30T10:48:04+08:00", n1.updated, "更新时间");
fireunit.compare("http://www.douban.com/note/10671354/", n1.link.home, "豆瓣页面");
fireunit.compare(true, n1.isPublic, "日记是否公开");
fireunit.compare(true, n1.isReplyEnabled, "日记是否允许评论");
// }}}

// {{{ Event
var e1 = Douban.event(event_1);
console.debug(e1);
fireunit.compare("http://api.douban.com/event/10132699", e1.id, "活动ID");
fireunit.compare("{NianNian's Home}我来为他（她）做蛋糕", e1.title, "活动名");
fireunit.compare("http://api.douban.com/people/1162488", e1.owner.id, "活动发起者");
fireunit.compare('注1', e1.content, "活动内容");
fireunit.compare('注2', e1.summary, "活动简介");
fireunit.compare('party', e1.category, "活动类别");
fireunit.compare('上海', e1.location, "活动城市");
fireunit.compare('2008-11-01T13:00:00+08:00', e1.time.start, "活动开始时间");
fireunit.compare('2008-11-30T21:00:00+08:00', e1.time.end, "活动结束时间");
fireunit.compare("上海 长乐路682弄6号后门4F", e1.address, "活动地点");
fireunit.compare(false, e1.isInviteOnly, "是否只邀请");
fireunit.compare(true, e1.isInviteEnabled, "是否允许邀请");
fireunit.compare(371, e1.participants, "参加者个数");
fireunit.compare(939, e1.wishers, "感兴趣人数");
// }}}

fireunit.testDone();
