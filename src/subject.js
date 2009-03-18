var BOOK_URL = API_HOST + '/book/subject',
    GET_BOOK_URL = BOOK_URL + '/{ID}',
    GET_BOOK_BY_ISBN_URL = BOOK_URL + '/isbn/{ID}',
    SEARCH_BOOK_URL = BOOK_URL + 's',

    MOVIE_URL = API_HOST + '/movie/subject',
    GET_MOVIE_URL = MOVIE_URL + '/{ID}',
    GET_MOVIE_BY_IMDB_URL = MOVIE_URL + '/imdb/{ID}',
    SEARCH_MOVIE_URL = MOVIE_URL + 's',

    MUSIC_URL = API_HOST + '/music/subject',
    GET_MUSIC_URL = MUSIC_URL + '/{ID}',
    SEARCH_MUSIC_URL = MUSIC_URL + 's';

// Douban Book API Service
var Book = Douban.service.book = function(service) {
    this.service = service;
};
Book.prototype = {
    // 获取书籍信息
    get: function(book, callback) {
        return this.service.get(book, callback, Douban.book, GET_BOOK_URL);
    },
    // 通过ISBN获取书籍信息
    isbn: function(isbn, callback) {
        return this.service.get(isbn, callback, Douban.book,
                                GET_BOOK_BY_ISBN_URL);
    },
    // 搜索书籍
    search: function(query, offset, limit, callback, extras) {
        return this.service.search(query, offset, limit, callback,
                                   Douban.book, SEARCH_BOOK_URL, extras);
    }
};

// Douban Movie API Service
var Movie = Douban.service.movie = function(service) {
    this.service = service;
};
Movie.prototype = {
    // 获取电影信息
    get: function(movie, callback) {
        return this.service.get(movie, callback, Douban.movie, GET_MOVIE_URL);
    },
    // 通过IMDB获取电影信息
    imdb: function(imdb, callback) {
        return this.service.get(imdb, callback, Douban.movie,
                                GET_MOVIE_BY_IMDB_URL);
    },
    // 搜索电影
    search: function(query, offset, limit, callback, extras) {
        return this.service.search(query, offset, limit, callback,
                                   Douban.movie, SEARCH_MOVIE_URL, extras);
    }
};

// Douban Music API Service
var Music = Douban.service.music = function(service) {
    this.service = service;
};
Music.prototype = {
    // 获取电影信息
    get: function(music, callback) {
        return this.service.get(music, callback, Douban.music, GET_MUSIC_URL);
    },
    // 搜索电影
    search: function(query, offset, limit, callback, extras) {
        return this.service.search(query, offset, limit, callback,
                                   Douban.music, SEARCH_MUSIC_URL, extras);
    }
};
