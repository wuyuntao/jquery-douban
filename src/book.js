/* Douban Book API Service
 * @method      get         获取书籍信息
 * @method      isbn        通过ISBN获取书籍信息
 * @method      search      搜索书籍
 */
var BookService = $.klass(SubjectService, {
    init: function($super, service) {
        this._model = Book;
        this._modelEntry = BookEntry;
        this._getSubjectUrl = GET_BOOK_URL;
        this._searchSubjectUrl = SEARCH_BOOK_URL;
        $super(service);
    },

    isbn: function(isbn, callback) {
        return this._get(isbn, callback, Book, GET_BOOK_BY_ISBN_URL);
    }
});

/* Douban book class
 * @param           data            Well-formatted json feed
 * @attribute       id              书本ID
 * @attribute       title           书名
 * @attribute       aka             又名
 * @attribute       subtitle        副标题
 * @attribute       authors         作者
 * @attribute       translators     译者
 * @attribute       isbn10          10位ISBN
 * @attribute       isbn13          13位ISBN
 * @attribute       releaseDate     发布时间
 * @attribute       publisher       出版社
 * @attribute       price           单价
 * @attribute       pages           页数
 * @attribute       binding         封装
 * @attribute       authorIntro     作者介绍
 * @attribute       summary         书本介绍
 * @attribute       url             条目URL
 * @attribute       imageUrl        封面URL
 * @attribute       tags            被标记最多的TAG
 * @attribute       rating          平均得分
 * @attribute       votes           投票人数
 * @method          createFromJson  由豆瓣返回的JSON，初始化数据
 */
var Book = $.klass(DoubanObject, {
    init: function($super, data) {
        this.all = ['id', 'title', 'aka', 'subtitle', 'authors', 'translators', 'isbn10', 'isbn13', 'releaseDate', 'publisher', 'price', 'pages', 'binding', 'authorIntro', 'summary', 'url', 'imageUrl', 'tags', 'rating', 'votes'];
        $super(data);
    }
});

/* Douban book entries
 */
var BookEntry = $.klass(SearchEntry, {
    init: function($super, data) {
        this.model = Book;
        $super(data);
    }
});
