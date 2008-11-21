(function($) {
/* 
 * jQuery Douban
 *
 * Copyright (c) 2008 Wu Yuntao <http://blog.luliban.com/>
 * Licensed under the Apache 2.0 license.
 *
 */

// {{{ Douban authentication and API URLs
const AUTH_HOST = 'http://www.douban.com';
const REQUEST_TOKEN_URL = AUTH_HOST + '/service/auth/request_token';
const AUTHORIZATION_URL = AUTH_HOST + '/service/auth/authorize';
const ACCESS_TOKEN_URL = AUTH_HOST + '/service/auth/access_token';

const API_HOST = 'http://api.douban.com';
const PEOPLE_URL = API_HOST + '/people';
// API BUG: 不加'/'的话，使用不能。http://www.douban.com/group/topic/4655057/ 
const SEARCH_PEOPLE_URL = PEOPLE_URL + '/';
const GET_PEOPLE_URL = PEOPLE_URL  + '/{USERNAME}';
const GET_CURRENT_URL = PEOPLE_URL  + '/%40me';     // %40 => @
const GET_FRIENDS_URL = GET_PEOPLE_URL + '/friends';
const GET_CONTACTS_URL = GET_PEOPLE_URL + '/contacts';

const NOTE_URL = API_HOST + '/note';
const GET_NOTE_URL = NOTE_URL + '/{NOTEID}';
const GET_USER_NOTE_URL = GET_PEOPLE_URL + '/notes';
const ADD_NOTE_URL = API_HOST + '/notes';
const UPDATE_NOTE_URL = GET_NOTE_URL;
const DELETE_NOTE_URL = GET_NOTE_URL;

const BOOK_URL = API_HOST + '/book/subject';
const GET_BOOK_URL = BOOK_URL + '/{ID}';
const SEARCH_BOOK_URL = BOOK_URL + 's';

const MOVIE_URL = API_HOST + '/movie/subject';
const GET_MOVIE_URL = MOVIE_URL + '/{ID}';
const SEARCH_MOVIE_URL = MOVIE_URL + 's';

const MUSIC_URL = API_HOST + '/music/subject';
const GET_MUSIC_URL = MUSIC_URL + '/{ID}';
const SEARCH_MUSIC_URL = MUSIC_URL + 's';

const REVIEW_URL = API_HOST + '/review';
const GET_REVIEW_URL = API_HOST + '/review/{ID}';
const GET_USERS_REVIEW_URL = GET_PEOPLE_URL + '/reviews';
const GET_BOOK_REVIEW_URL = GET_BOOK_URL + '/reviews';
const GET_MOVIE_REVIEW_URL = GET_MOVIE_URL + '/reviews';
const GET_MUSIC_REVIEW_URL = GET_MUSIC_URL + '/reviews';
const ADD_REVIEW_URL = REVIEW_URL + 's';
const UPDATE_REVIEW_URL = GET_REVIEW_URL;
const DELETE_REVIEW_URL = GET_REVIEW_URL;
// }}}

// {{{ jQuery Douban
/* Factory method of jQuery Douban
 * @returns     Douban service object
 * @param       options Dict
 * @usage
 * var service = $.douban({ apiKey: 'blahblah', apiSecret: 'blahblah' });
 * service.login(accessKey, accessSecret);
 * if (service.isAuthenticated()) {
 *     var id = service.miniblog.add("发送一条广播");
 * }
 */
$.douban = function(factory, options) {
    if (typeof factory != 'string') {
        options = factory;
        factory = 'service';
    }
    if (typeof $.douban[factory] != 'undefined') {
        return $.douban[factory].factory(options);
    } else {
        return false;
    }
};

/* Factory method of Douban Service
 * @returns     Douban service object
 * @param       options Dict
 * @usage
 * var service = $.douban.service.factory({ apiKey: 'blah', apiSecret: 'blah' });
 * var id = service.miniblog.add("发送广播");
 * service.miniblog.delete(id);
 */
$.douban.service = {
    factory: function(options) {
        return new DoubanService(options);
    }
};

/* Factory method of OAuth Client
 * @returns     OAuth client object
 * @param       options Dict
 * @usage
 * var apiToken = { apiKey: 'blah', apiSecret: 'blah' };
 * var client = $.douban.client.factory({ apiToken: apiToken })
 * var requestToken = client.getRequestToken();
 * var url = client.getAuthorizationUrl(requestToken);
 * var accessToken = client.getAccessToken(requestToken);
 * var login = client.login(accessToken);
 */
$.douban.client = {
    factory: function(options) {
        return new OAuthClient(options);
    }
};

/* Factory method of Douban objects
 */
$.douban.book = {
    factory: function(data) {
        return new Book(data);
    }
};

$.douban.movie = {
    factory: function(data) {
        return new Movie(data);
    }
};

$.douban.music = {
    factory: function(data) {
        return new Music(data);
    }
};

$.douban.note = {
    factory: function(data) {
        return new Note(data);
    },
    createXml: function(title, content, isPublic, isReplyEnabled) {
        return Note.createXml(title, content, isPublic, isReplyEnabled);
    }
};

$.douban.review = {
    factory: function(data) {
        return new Review(data);
    },
    createXml: function(id, title, content, rating) {
        return Review.createXml(id, title, content, rating);
    }
};

$.douban.user = {
    factory: function(data) {
        return new User(data);
    }
};

/* Factory method of HTTP request handlers
 * @usage
 * // Register new request handler
 * $.douban.http.register('air', AirHttpRequestHandler });
 * // Use Gears HTTP Request API as handler
 * $.douban.http.setActive('gears');
 * // Get some url
 * var json = $.douban.http({ url: url, params: params });
 * // Unregister request handler
 * $.douban.http.unregister('air');
 *
 */
$.douban.http = function(options) {
    return $.douban.http.activeHandler(options);
};

/* Create HTTP request handler by the given type
 * including 'jquery', 'greasemonkey' and 'gears'
 * In addition, you can register other handlers either
 * by passing arguments ``httpType`` and ``httpHandler`` to the factory
 * method
 */
$.douban.http.factory = function(options) {
    /* Default options */
    var defaults = {
        type: 'jquery',
        handler: null
    },
    options = $.extend(defaults, options || {});
    if (typeof $.douban.http.handlers[options.type] == 'undefined') {
        // Register and set active the new handler
        if ($.isFunction(options.handler)) {
            $.douban.http.register(options.type, options.handler);
        } else {
            throw new Error("Invalid HTTP request handler");
        }
    }
    return $.douban.http.handlers[options.type];
};

/* Setup HTTP settings */
$.douban.http.setup = function(options) {
    $.douban.http.settings = $.extend($.douban.http.settings, options || {});
};

/* Default settings
 */
$.douban.http.settings = {
    url: location.href,
    type: 'GET',
    params: null,
    data: null,
    headers: null,
    contentType: 'application/atom+xml',
    dataType: 'json',
    processData: true
};

/* Default handler is jquery
 */
$.douban.http.activeHandler = jqueryHandler;

/* A dict of HTTP request name and its constructor,
 */
$.douban.http.handlers = {
    jquery: jqueryHandler,
    greasemonkey: greasemonkeyHandler,
    gears: gearsHandler
};

$.douban.http.setActive = function(name) {
    $.douban.http.activeHandler = $.douban.http.handlers[name];
}

/* Register new HTTP request handler to ``handlers``
 */
$.douban.http.register = function(name, handler) {
    if ($.isFunction(handler)) {
        $.douban.http.handlers[name] = constructor;
    }
};

/* Unregister an existed HTTP request handler
 */
$.douban.http.unregister = function(name) {
    $.douban.http.handlers[name] = undefined;
};

/* Built-in HTTP request handlers: 'jquery', 'greasemonkey' and 'gears'
 */
function jqueryHandler(options) {
    // options = $.extend($.douban.http.settings, options);
    return $.ajax(options);
}
jqueryHandler.name = 'jquery';

function greasemonkeyHandler(options) {
    throw new Error("Not Implemented Yet");
}
greasemonkeyHandler.name = 'greasemonkey';

function gearsHandler(options) {
    throw new Error("Not Implemented Yet");
}
gearsHandler.name = 'gears';
// }}}

/* {{{ Some utilities
 */
// Add methods to class
// Copied from Low Pro for jQuery
// http://www.danwebb.net/2008/2/3/how-to-use-low-pro-for-jquery
function addMethods(source) {
    var ancestor   = this.superclass && this.superclass.prototype;
    var properties = $.keys(source);

    if (!$.keys({ toString: true }).length) 
        properties.push("toString", "valueOf");

    for (var i = 0, length = properties.length; i < length; i++) {
        var property = properties[i], value = source[property];
        if (ancestor && $.isFunction(value) && $.argumentNames(value)[0] == "$super") {
        
            var method = value, value = $.extend($.wrap((function(m) {
                return function() { return ancestor[m].apply(this, arguments) };
            })(property), method), {
                valueOf:  function() { return method },
                toString: function() { return method.toString() }
            });
        }
        this.prototype[property] = value;
    }
    return this;
}

$.extend({
    /* Get keys of an object
     */
    keys: function(obj) {
        var keys = [];
        for (var key in obj) keys.push(key);
        return keys;
    },

    /* Returns argument names of a function
     */
    argumentNames: function(func) {
        var names = func.toString().match(/^[\s\(]*function[^(]*\((.*?)\)/)[1].split(/, ?/);
        return names.length == 1 && !names[0] ? [] : names;
    },

    bind: function(func, scope) {
      return function() {
        return func.apply(scope, $.makeArray(arguments));
      }
    },

    wrap: function(func, wrapper) {
      var __method = func;
      return function() {
        return wrapper.apply(this, [$.bind(__method, this)].concat($.makeArray(arguments)));
      }
    },

    /* Class creation and inheriance.
     * Copied from Low Pro for jQuery
     * http://www.danwebb.net/2008/2/3/how-to-use-low-pro-for-jquery
     */
    class: function() {
        var parent = null;
        var properties = $.makeArray(arguments);
        if ($.isFunction(properties[0])) parent = properties.shift();
        var klass = function() {
            this.init.apply(this, arguments);
        };
        klass.superclass = parent;
        klass.subclasses = [];
        klass.addMethods = addMethods;
        if (parent) {
            var subclass = function() { };
            subclass.prototype = parent.prototype;
            klass.prototype = new subclass;
            parent.subclasses.push(klass);
        }
        for (var i = 0, len = properties.length; i < len; i++)
            klass.addMethods(properties[i]);
        if (!klass.prototype.init)
            klass.prototype.init = function() {};
        klass.prototype.constructor = klass;
        return klass;
    },

    /* Parse datetime string to Date object
     */
    parseDate: function(str) {
        var re = /^(\d{4})\-(\d{2})\-(\d{2})T(\d{2}):(\d{2}):(\d{2})/;
        var date = str.match(re);
        for (var i = 1, len = date.length; i < len; i++) {
            date[i] = parseInt(date[i]);
            if (i == 2) date[i] -= 1;
        }
        return new Date(date[1], date[2], date[3], date[4], date[5], date[6]);
    },

    /* The opposiite of jQuery's native $.param() method.
     * Deserialises a parameter string to an object:
     */
    unparam: function(params) {
        var obj = new Object();
        $.each(params.split('&'), function() {
            var param = this.split('=');
            var key = decodeURIComponent(param[0]);
            var value = decodeURIComponent(param[1]);
            obj[key] = value;
        });
        return obj;
    }
});
// }}}

/* {{{ Douban service classes, like ``DoubanService`` and ``UserService``

/* Douban client
 * @returns     null
 * @param       options Dict
 * @option      apiKey String
 * @option      apiSecret String
 * @option      httpType String
 * @option      httpHandler String
 */
var DoubanService = $.class({
    init: function(options) {
        var defaults = {
            apiKey: '',
            apiSecret: '',
            httpType: 'jquery',
        };
        this.options = $.extend(defaults, options || {});;
        this.api = new Token(this.options.apiKey, this.options.apiSecret);
        this._http = $.douban.http.factory({ type: this.options.httpType });
        this._client = $.douban.client.factory({ apiKey: this.api.key,
                                                 apiSecret: this.api.secret,
                                                 type: this.options.httpType });
        var services = {
            'user': UserService,
            'note': NoteService,
            'book': BookService,
            'movie': MovieService,
            'music': MusicService,
            'review': ReviewService,
        }
        for (var name in services) {
            this[name] = new services[name](this);
        }
    },

    login: function(accessToken) {
        return this._client.login(accessToken);
    },

    get: function(url, params, callback) {
        var json = null;
        var params = this.setParams(params);
        var setHeaders = this.setHeaders(url, 'GET', params);
        this._http({ async: false,
                     url: url,
                     type: 'GET',
                     data: params,
                     dataType: 'json',
                     beforeSend: setHeaders,
                     success: onSuccess });
        return json;

        function onSuccess(data) {
            json = data;
            if ($.isFunction(callback)) callback(data);
        }
    },

    post: function(url, data, callback) {
        var json = null;
        var params = this.setParams();
        var setHeaders = this.setHeaders(url, 'POST', params);
        var url = url + '?' + $.param(params);
        this._http({ async: false,
                     url: url,
                     data: data,
                     dataType: 'json',
                     type: 'POST',
                     contentType: 'application/atom+xml',
                     processData: false,
                     beforeSend: setHeaders,
                     success: onSuccess });
        return json;

        function onSuccess(data) {
            json = data;
            if ($.isFunction(callback)) callback(data);
        }
    },

    put: function(url, data, callback) {
        var json = null;
        var params = this.setParams();
        var setHeaders = this.setHeaders(url, 'PUT', params);
        var url = url + '?' + $.param(params);
        this._http({ async: false,
                     url: url,
                     data: data,
                     dataType: 'json',
                     type: 'PUT',
                     contentType: 'application/atom+xml',
                     processData: false,
                     beforeSend: setHeaders,
                     success: onSuccess });
        return json;

        function onSuccess(data) {
            json = data;
            if ($.isFunction(callback)) callback(data);
        }
    },

    delete: function(url, callback) {
        var response = null;
        var params = this.setParams();
        var setHeaders = this.setHeaders(url, 'DELETE', params);
        this._http({ async: false,
                     url: url,
                     type: 'DELETE',
                     data: params,
                     beforeSend: setHeaders,
                     success: onSuccess });
        return response;

        function onSuccess(data) {
            response = data;
            if ($.isFunction(callback)) callback(data);
        }
    },

    setParams: function(params) {
        params = $.extend({ 'apikey': this.api.key, 'alt': 'json' }, params || {});
        return params;
    },

    /* Set headers for request
     * @returns     beforeSend callback function
     * @param       url String
     * @param       type String. 'GET', 'PUT', 'POST' or 'DELETE'
     * @param       params Dict
     */
    setHeaders: function(url, type, params) {
        var headers = this._client.getAuthHeaders(url, type, params);
        return function(xhr) {
            xhr.setRequestHeader('Authorization', headers);
            xhr.setRequestHeader('WWW-Authenticate', 'OAuth realm=""');
        }
    }
});

/* Base class of Douban API services
 */
var BaseService = $.class({
    init: function(service) {
        this._service = service;
    },

    /* Get URL from ID, API URL or object
     * @returns url
     * @param   obj Object or String
     * @param   tmpl String
     */
    lazyUrl: function(obj, tmpl) {
        if (typeof obj == 'object') return obj.id;
        else if (obj.match(/^\d+$/)) return tmpl.replace(/\{ID\}/, obj);
        else return obj;
    }
});

/* Douban User API Service
 * @method      get             获取用户信息
 * @method      search          获取当前授权用户信息
 * @method      current         搜索用户
 * @method      friend          获取用户朋友
 * @method      contact         获取用户关注的人
 */
var UserService = $.class(BaseService, {
    get: function(name) {
        var url = GET_PEOPLE_URL.replace(/\{USERNAME\}/, name);
        var json = this._service.get(url);
        return json ? new User(json) : false;
    },

    search: function(query, offset, limit) {
        var url = SEARCH_PEOPLE_URL;
        var params = { 'q': query, 'start-index': offset + 1 || 1, 'max-results': limit || 50 };
        var json = this._service.get(url, params);
        return json ? new UserEntries(json) : false;
    },

    current: function() {
        var url = GET_CURRENT_URL;
        var json = this._service.get(url);
        return json ? new User(json) : false;
    },

    friends: function(user, offset, limit) {
        var url = GET_FRIENDS_URL.replace(/\{USERNAME\}/, user);
        var params = { 'start-index': offset + 1 || 1, 'max-results': limit || 50 };
        var json = this._service.get(url, params);
        return json ? new UserEntries(json) : false;
    },

    contacts: function(user, offset, limit) {
        var url = GET_CONTACTS_URL.replace(/\{USERNAME\}/, user);
        var params = { 'start-index': offset + 1 || 1, 'max-results': limit || 50 };
        var json = this._service.get(url, params);
        return json ? new UserEntries(json) : false;
    }
});

/* Douban Note API Service
 * @method      get             获取日记
 * @method      getForUser      获取用户的所有日记
 * @method      add             发表新日记
 * @method      update          更新日记
 * @method      delete          删除日记
 */
var NoteService = $.class(BaseService, {
    get: function(note) {
        if (typeof note == 'object') var url = note.id;
        else var url = GET_NOTE_URL.replace(/\{NOTEID\}/, note);
        var json = this._service.get(url);
        return json ? new Note(json) : false;
    },

    getForUser: function(user, offset, limit) {
        if (typeof user == 'object') var url = user.id + '/notes';
        else if (typeof user == 'string') var url = GET_USER_NOTE_URL.replace(/\{USERNAME\}/, user);
        var params = { 'start-index': offset + 1 || 1, 'max-results': limit || 50 };
        var json = this._service.get(url, params);
        return json ? new NoteEntries(json) : false;
    },

    add: function(title, content, isPublic, isReplyEnabled) {
        var url = ADD_NOTE_URL;
        var data = Note.createXml(title, content, isPublic, isReplyEnabled);
        var json = this._service.post(url, data);
        return json ? new Note(json) : false;
    },

    update: function(note, title, content, isPublic, isReplyEnabled) {
        if (typeof note == 'object') var url = note.id;
        else if (note.match(/\d+/)) var url = UPDATE_NOTE_URL.replace(/\{NOTEID\}/, note);
        var data = Note.createXml(title, content, isPublic, isReplyEnabled);
        var json = this._service.put(url, data);
        return json ? new Note(json) : false;
    },

    delete: function(note) {
        if (typeof note == 'object') var url = note.id;
        else if (note.match(/\d+/)) var url = UPDATE_NOTE_URL.replace(/\{NOTEID\}/, note);
        var response = this._service.delete(url);
        return response == 'ok' ? true : false;
    }
});

// Base class of book, movie and music service
var SubjectService = $.class(BaseService, {
    get: function(subject, model, url) {
        var url = this.lazyUrl(subject, url);
        var json = this._service.get(url);
        return new model(json);
    },
    search: function(query, offset, limit, model, url) {
        var params = { 'q': query, 'start-index': offset + 1 || 1, 'max-results': limit || 50 };
        var json = this._service.get(url, params);
        return new model(json);
    }
});

var BookService = $.class(SubjectService, {
    get: function($super, book) {
        return $super(book, Book, GET_BOOK_URL);
    },
    search: function($super, query, offset, limit) {
        return $super(query, offset, limit, BookEntries, SEARCH_BOOK_URL);
    }
});

var MovieService = $.class(SubjectService, {
    get: function($super, movie) {
        return $super(movie, Movie, GET_MOVIE_URL);
    },
    search: function($super, query, offset, limit) {
        return $super(query, offset, limit, MovieEntries, SEARCH_MOVIE_URL);
    }
});

var MusicService = $.class(SubjectService, {
    get: function($super, music) {
        return $super(music, Music, GET_MUSIC_URL);
    },

    search: function($super, query, offset, limit) {
        return $super(query, offset, limit, MusicEntries, SEARCH_MUSIC_URL);
    }
});

/* Douban Review API
 * @method      get             获取评论信息
 * @method      getForUser      特定用户的所有评论
 * @method      getForSubject   特定书籍、电影、音乐的所有评论
 * @method      add             发布新评论
 * @method      update          修改评论
 * @method      delete          删除评论
     */
var ReviewService = $.class(BaseService, {
    get: function(review) {
        var url = this.lazyUrl(review, GET_REVIEW_URL);
        var json = this._service.get(url);
        return new Review(json);
    },

    getForUser: function(user, offset, limit) {
        var url = this.lazyUrl(user, GET_PEOPLE_URL)+ '/reviews';
        var params = { 'start-index': offset + 1 || 1, 'max-results': limit || 50 };
        var json = this._service.get(url, params);
        return new AuthorReviewEntries(json);
    },

    getForSubject: function(subject, offset, limit) {
        var url = this.lazyUrl(subject) + '/reviews';
        var params = { 'start-index': offset + 1 || 1, 'max-results': limit || 50 };
        var json = this._service.get(url, params);
        return new SubjectReviewEntries(json);
    },

    add: function(subject, title, content, rating) {
        var subject = this.lazyUrl(subject);
        var url = ADD_REVIEW_URL;
        var data = Review.createXml(subject, title, content, rating);
        var json = this._service.post(url, data);
        return new Review(json);
    },

    update: function(review, title, content, rating) {
        var url = this.lazyUrl(review, UPDATE_REVIEW_URL);
        var data = Review.createXml(url, title, content, rating);
        var json = this._service.put(url, data);
        return new Review(json);
    },

    delete: function(review) {
        var url = this.lazyUrl(review, DELETE_REVIEW_URL);
        var response = this._service.delete(url);
        return response == 'ok' ? true : false;
    }
});
// }}}

// {{{ Douban object classes like ``User`` and ``Note``
/* Base class of douban object like user and note 
 * @param   feed JSON. Gdata JSON feed
 */
var DoubanObject = $.class({
    init: function(feed) {
        this._feed = feed;
        this.createFromJson();
    },

    /* Create object from given JSON feed. Please implement it in subclass.
     * @param   data JSON
     */
    createFromJson: function() {
        throw new Error("Not Implemented Yet");
    },

    /* Get read-only json feed
     */
    getFeed: function() {
        return this._feed;
    },

    /* JSON feed parsers
     */
    // Get the attribute which is first got
    getAttr: function (attr) {
        if (!this._feed) return;
        if (this._feed[attr]) return this._feed[attr]['$t'];
        var attrs = this._feed['db:attribute'];
        if (attrs)
            for (var i in attrs)
                if (attrs[i]['@name'] == attr) return attrs[i]['$t'];
    },

    getUrl: function(attr) {
        if (!this._feed) return;
        // default ``attr`` is 'alternate'
        attr = attr || 'alternate';
        var links = this._feed['link'];
        for (var i in links)
            if (links[i]['@rel'] == attr) return links[i]['@href'];
    },

    getId: function() {
        return this.getUrl('self');
    },

    getTitle: function() {
        return this.getAttr('title');
    },

    getAuthor: function() {
        if (this._feed && this._feed.author) return new User(this._feed.author);
    },

    getSummary: function() {
        return this.getAttr('summary');
    },

    getContent: function() {
        return this.getAttr('content');
    },

    getIconUrl: function() {
        return this.getUrl('icon');
    },

    getTime: function(attr) {
        var time = this.getAttr(attr);
        return time ? $.parseDate(time) : undefined;
    },

    getPublished: function() {
        return this.getTime('published');
    },

    getUpdated: function() {
        return this.getTime('updated');
    },

    getRating: function() {
        if (!this._feed || !this._feed['gd:rating']) return;
        return parseFloat(this._feed['gd:rating']['@average'] || 
                          this._feed['gd:rating']['@value']);
    },

    getTags: function() {
        if (!this._feed || !this._feed['db:tag']) return;
        var tags = [], entries = this._feed['db:tag'];
        for (var i = 0, len = entries.length; i < len; i++)
            tags.push(new Tag(entries[i]['@name'], entries[i]['@count']));
        return tags;
    }

});

var DoubanObjectEntries = $.class(DoubanObject, {
    init: function(feed) {
        this._feed = feed;
        this._entries = feed.entry;
        this.createFromJson();
    },

    /* Create object from given JSON feed.
     * Get general attributes for entry feed, like ``total`` and ``limit``
     * @param   data JSON
     */
    createFromJson: function(doubanObject) {
        this.total = this.getTotal();
        this.offset = this.getOffset();
        this.limit = this.getLimit();
        this.entries = [];
        for (var i = 0, len = this._entries.length; i < len; i++) {
            this.entries.push(new doubanObject(this._entries[i]));
        }
    },

    getTotal: function() {
        return parseInt(this.getAttr("opensearch:totalResults") || "0");
    },

    getOffset: function() {
        return parseInt(this.getAttr("opensearch:startIndex") || "1") - 1;
    },

    getLimit: function() {
        return parseInt(this.getAttr("opensearch:itemsPerPage") || "0");
    }

});

var AuthorEntries = $.class(DoubanObjectEntries, {
    createFromJson: function($super, doubanObject) {
        this.title = this.getTitle();
        this.author = this.getAuthor();
        $super(doubanObject);
    }
});

var SubjectEntries = $.class(DoubanObjectEntries, {
    createFromJson: function($super, doubanObject) {
        this.title = this.getTitle();
        $super(doubanObject);
    }
});

var SearchEntries = $.class(DoubanObjectEntries, {
    createFromJson: function($super, doubanObject) {
        this.query = this.getTitle().replace(/^搜索\ /, '').replace(/\ 的结果$/, '');
        $super(doubanObject);
    }
});

/* Douban user class
 * @param           data            Well-formatted json feed
 * @attribute       id              用户ID，"http://api.douban.com/people/1000001"
 * @attribute       userName        用户名，"ahbei"
 * @attribute       screenName      昵称，"阿北"
 * @attribute       location        常居地，"北京"
 * @attribute       blog            网志主页，"http://ahbei.com/"
 * @attribute       intro           自我介绍，"豆瓣的临时总管..."
 * @attribute       url             豆瓣主页，"http://www.douban.com/people/ahbei/"
 * @attribute       iconUrl         头像，"http://otho.douban.com/icon/u1000001-14.jpg"
 * @method          createFromJson  由豆瓣返回的用户JSON，初始化用户数据
 */
var User = $.class(DoubanObject, {
    createFromJson: function() {
        this.id = this.getUserId();
        this.userName = this.getUserName()
        this.screenName = this.getScreenName();
        this.location = this.getLocation();
        this.intro = this.getContent();
        this.url = this.getUrl();
        this.iconUrl = this.getIconUrl();
        this.blog = this.getBlog();
    },

    /* JSON feed parsers */
    getUserId: function() {
        return this.getAttr('id') || this.getAttr('uri');
    },

    getUserName: function() {
        return this.getAttr('db:uid');
    },

    getScreenName: function() {
        return this.getTitle() || this.getAttr('name');
    },

    getLocation: function() {
        return this.getAttr('db:location');
    },

    getBlog: function() {
        return this.getUrl('homepage');
    }
});

/* Douban user entries
 * @param       data                Well-formatted json feed
 * @attribute   total
 * @attribute   offset
 * @attribute   limit
 * @attribute   entries
 * @method      createFromJson
 */
var UserEntries = $.class(SearchEntries, {
    createFromJson: function($super) {
        $super(User);
    }
});

/* Douban note
 * @param           data            Well-formatted json feed
 * @attribute       id              用户ID，"http://api.douban.com/people/1000001"
 * @attribute       userName        用户名，"ahbei"
 * @attribute       screenName      昵称，"阿北"
 * @attribute       location        常居地，"北京"
 * @attribute       blog            网志主页，"http://ahbei.com/"
 * @attribute       intro           自我介绍，"豆瓣的临时总管..."
 * @attribute       url             豆瓣主页，"http://www.douban.com/people/ahbei/"
 * @attribute       iconUrl         头像，"http://otho.douban.com/icon/u1000001-14.jpg"
 * @method          createFromJson  由豆瓣返回的用户JSON，初始化用户数据
 */
var Note = $.class(DoubanObject, {
    createFromJson: function() {
        this.id = this.getId();
        this.title = this.getTitle();
        this.author = this.getAuthor();
        this.summary = this.getSummary();
        this.content = this.getContent();
        this.published = this.getPublished();
        this.updated = this.getUpdated();
        this.url = this.getUrl();
        this.isPublic = this.getIsPublic();
        this.isReplyEnabled = this.getIsReplyEnabled();
    },

    getIsPublic: function() {
        return this.getAttr('privacy') == 'public' ? true: false;
    },

    getIsReplyEnabled: function() {
        return this.getAttr('can_reply') == 'yes' ? true: false;
    }
});
// Class methods
/* create POST or PUT xml
* @param       title String
* @param       content String
* @param       isPublic Boolean
* @param       isReplyEnabled Boolean
*/
Note.createXml = function(title, content, isPublic, isReplyEnabled) {
    isPublic = isPublic ? 'public' : 'private';
    isReplyEnabled = isReplyEnabled ? 'yes' : 'no';
    var xml = '<?xml version="1.0" encoding="UTF-8"?><entry xmlns="http://www.w3.org/2005/Atom" xmlns:db="http://www.douban.com/xmlns/"><title>{TITLE}</title><content>{CONTENT}</content><db:attribute name="privacy">{IS_PUBLIC}</db:attribute><db:attribute name="can_reply">{IS_REPLY_ENABLED}</db:attribute></entry>';
    return xml.replace(/\{TITLE\}/, title)
              .replace(/\{CONTENT\}/, content)
              .replace(/\{IS_PUBLIC\}/, isPublic)
              .replace(/\{IS_REPLY_ENABLED\}/, isReplyEnabled);
};

/* Douban note entries
 * @param       data                Well-formatted json feed
 * @attribute   total
 * @attribute   offset
 * @attribute   limit
 * @attribute   entries
 * @method      createFromJson
 */
var NoteEntries = $.class(AuthorEntries, {
    createFromJson: function($super) {
        $super(Note);
    }
});

var Subject = $.class(DoubanObject, {
    createFromJson: function() {
    },

    // Returns a list of attributes
    getAttrs: function(name) {
        if (!this._feed || !this._feed['db:attribute']) return;
        var attrs = [], feedAttributes = this._feed['db:attribute'];
        for (var i = 0, len = feedAttributes.length; i < len; i++)
            if (feedAttributes[i]['@name'] == name)
                attrs.push(feedAttributes[i]['$t']);
        return attrs;
    },

    getIconUrl: function() {
        return this.getUrl('image');
    },

    getAka: function() {
        return this.getAttrs('aka');
    },

    getReleaseDate: function() {
        return this.getAttr('pubdate');
    },

    getPublisher: function() {
        return this.getAttr('publisher');
    },

    getVotes: function() {
        if (!this._feed || !this._feed['gd:rating']) return;
        return this._feed['gd:rating']['@numRaters'];
    }
});
// Class method
Subject.factory = function(json) {
    if (typeof json == 'undefined') return json;
    var category = json['category']['@term'];
    if (category.match(/book$/)) {
        return new Book(json);
    } else if (category.match(/movie$/)) {
        return new Movie(json);
    } else if (category.match(/music$/)) {
        return new Music(json);
    }
};

var Book = $.class(Subject, {
    createFromJson: function($super) {
        this.id = this.getId();
        this.title = this.getTitle();
        this.aka = this.getAka();
        this.subtitle = this.getSubtitle();
        this.authors = this.getAuthors();
        this.translators = this.getTranslators();
        this.isbn10 = this.getIsbn10();
        this.isbn13 = this.getIsbn13();
        this.releaseDate = this.getReleaseDate();
        this.publisher = this.getPublisher();
        this.price = this.getPrice();
        this.pages = this.getPages();
        this.binding = this.getBinding();
        this.authorIntro = this.getAuthorIntro();
        this.summary = this.getSummary();
        this.url = this.getUrl();
        this.iconUrl = this.getIconUrl();
        this.tags = this.getTags();
        this.rating = this.getRating();
        this.votes = this.getVotes();
        $super();
    },
    
    getSubtitle: function() {
        return this.getAttr('subtitle');
    },

    getAuthors: function() {
        return this.getAttrs('author');
    },

    getTranslators: function() {
        return this.getAttrs('translator');
    },

    getIsbn10: function() {
        return this.getAttr('isbn10');
    },

    getIsbn13: function() {
        return this.getAttr('isbn13');
    },

    getPages: function() {
        return this.getAttr('pages');
    },

    getPrice: function() {
        return this.getAttr('price');
    },

    getBinding: function() {
        return this.getAttr('binding');
    },

    getAuthorIntro: function() {
        return this.getAttr('author-intro');
    }
});

var BookEntries = $.class(SearchEntries, {
    createFromJson: function($super) {
        $super(Book);
    }
});

var Movie = $.class(Subject, {
    createFromJson: function($super) {
        this.id = this.getId();
        this.title = this.getTitle();
        this.chineseTitle = this.getChineseTitle();
        this.aka = this.getAka();
        this.directors = this.getDirectors();
        this.writers = this.getWriters();
        this.cast = this.getCast()
        this.imdb = this.getImdb();
        this.releaseDate = this.getReleaseDate();
        this.episode = this.getEpisode();
        this.language = this.getLanguage();
        this.country = this.getCountry();
        this.summary = this.getSummary();
        this.url = this.getUrl();
        this.iconUrl = this.getIconUrl();
        this.website = this.getWebsite();
        this.tags = this.getTags();
        this.rating = this.getRating();
        this.votes = this.getVotes();
        $super();
    },

    getChineseTitle: function() {
        if (!this._feed || !this._feed['db:attribute']) return;
        var attrs = this._feed['db:attribute'];
        for (var i = 0, len = attrs.length; i < len; i++)
            if (attrs[i]['@name'] == 'aka' && attrs[i]['@lang'] == 'zh_CN')
                return attrs[i]['$t'];
    },

    getDirectors: function() {
        return this.getAttrs('director');
    },

    getWriters: function() {
        return this.getAttrs('writer');
    },

    getCast: function() {
        return this.getAttrs('cast');
    },

    getEpisode: function() {
        return this.getAttr('episode');
    },

    getImdb: function() {
        return this.getAttr('imdb');
    },

    getLanguage: function() {
        return this.getAttrs('language');
    },

    getCountry: function() {
        return this.getAttrs('country');
    },

    getWebsite: function() {
        return this.getAttr('website');
    }
});

var MovieEntries = $.class(SearchEntries, {
    createFromJson: function($super) {
        $super(Movie);
    }
});

var Music = $.class(Subject, {
    createFromJson: function($super) {
        this.id = this.getId();
        this.title = this.getTitle();
        this.aka = this.getAka();
        this.artists = this.getArtists();
        this.ean = this.getEan();
        this.releaseDate = this.getReleaseDate();
        this.publisher = this.getPublisher();
        this.media = this.getMedia();
        this.discs = this.getDiscs();
        this.version = this.getVersion();
        this.summary = this.getSummary();
        this.tracks = this.getTracks();
        this.url = this.getUrl();
        this.iconUrl = this.getIconUrl();
        this.tags = this.getTags();
        this.rating = this.getRating();
        this.votes = this.getVotes();
        $super();
    },

    getArtists: function() {
        return this.getAttrs('singer');
    },

    getEan: function() {
        return this.getAttr('ean');
    },

    getTracks: function() {
        return this.getAttr('track');
    },

    getMedia: function() {
        return this.getAttr('media');
    },

    getDiscs: function() {
        return this.getAttr('discs');
    },

    getVersion: function() {
        return this.getAttr('version');
    }
});

var MusicEntries = $.class(SearchEntries, {
    createFromJson: function($super) {
        $super(Music);
    }
});

var Review = $.class(DoubanObject, {
    createFromJson: function() {
        this.id = this.getId()
        this.title = this.getTitle();
        this.author = this.getAuthor();
        this.subject = this.getSubject();
        this.summary = this.getSummary();
        this.content = this.getContent();
        this.published = this.getPublished();
        this.updated = this.getUpdated();
        this.url = this.getUrl();
        this.rating = this.getRating();
    },

    getSubject: function() {
        if (!this._feed || !this._feed['db:subject']) return;
        return Subject.factory(this._feed['db:subject']);
    }
});
// Class methods
/* create POST or PUT xml
* @param       title String
* @param       content String
* @param       isPublic Boolean
* @param       isReplyEnabled Boolean
*/
Review.createXml = function(review, title, content, rating) {
    if (typeof review == 'reviewect') var id = review.id;
    else if (review.match(/^\d+$/)) var id = GET_REVIEW_URL.replace(/\{ID\}/, review);
    else var id = review;
    var xml = '<?xml version="1.0" encoding="UTF-8"?><entry xmlns:ns0="http://www.w3.org/2005/Atom"><db:subject xmlns:db="http://www.douban.com/xmlns/"><id>{ID}</id></db:subject><content>{CONTENT}</content><gd:rating xmlns:gd="http://schemas.google.com/g/2005" value="{RATING}" ></gd:rating><title>{TITLE}</title></entry>';
    return xml.replace(/\{ID\}/, id)
              .replace(/\{TITLE\}/, title)
              .replace(/\{CONTENT\}/, content)
              .replace(/\{RATING\}/, rating);
};

var AuthorReviewEntries = $.class(AuthorEntries, {
    createFromJson: function($super) {
        $super(Review);
    }
});

var SubjectReviewEntries = $.class(SubjectEntries, {
    createFromJson: function($super) {
        $super(Review);
    }
});

/* A simple tag object */
function Tag(name, count) {
    this.name = name;
    this.count = count;
}
// }}}

/* {{{ OAuth client
 */
function OAuthClient(options) {
    /* Default options */
    var defaults = {
        apiKey: '',
        apiSecret: '',
        httpType: 'jquery',
    };
    this.options = $.extend(defaults, options || {});;
    this.api = new Token(this.options.apiKey, this.options.apiSecret);
    this._http = $.douban.http.factory({ type: this.options.httpType });

    this.requestToken = new Token();
    this.accessToken = new Token();
    this.authorizationUrl = '';
    this.userId = '';
}
$.extend(OAuthClient.prototype, {
    /* Get request token
     * @returns         Token object
     */ 
    getRequestToken: function() {
        var token = null;
        this.oauthRequest(REQUEST_TOKEN_URL, null, function(data) {
            data = $.unparam(data);
            token = { key: data.oauth_token,
                      secret: data.oauth_token_secret };
        });
        this.requestToken = token;
        return this.requestToken
    },

    /* Get authorization URL
     * @returns     url string
     * @param       requestToken Token. If not specified, using
     *              ``this.requestToken`` instead
     * @param       callbackUrl String
     */
    getAuthorizationUrl: function(requestToken, callbackUrl) {
        // shift arguments if ``requestToken`` was ommited
        if (typeof requestToken == 'string') {
            callbackUrl = requestToken;
            requestToken = this.requestToken;
        }
        var params = $.param({ oauth_token: requestToken.key,
                               oauth_callback: encodeURIComponent(callbackUrl) });
        this.authorizationUrl = AUTHORIZATION_URL + '?' + params;
        return this.authorizationUrl
    },

    /* Get access token
     * @returns     token object
     * @param       requestToken Token. If not specified, using
     *              ``this.requestToken`` instead
     */
    getAccessToken: function(requestToken) {
        var token = null;
        var userId = null;
        requestToken = requestToken || this.requestToken;
        this.oauthRequest(ACCESS_TOKEN_URL,
                          { oauth_token: requestToken.key },
                          callback);
        this.userId = userId;
        this.accessToken = token;
        return this.accessToken;

        function callback(data) {
            data = $.unparam(data);
            token = { key: data.oauth_token,
                      secret: data.oauth_token_secret };
            userId = data.douban_user_id;
        }
    },

    /* Save access token
     * returns      if login Boolean
     */
    login: function(accessToken) {
        accessToken = accessToken || this.accessToken;
        // check length of access token
        if (accessToken.key.length == 32 && accessToken.secret.length == 16) {
            this.accessToken = accessToken;
            return true;
        }
    },

    /* Check if useris authenticated
     * returns      if authenticated Boolean
     */
    isAuthenticated: function() {
        return this.login();
    },

    /* Get OAuth headers
     */
    getAuthHeaders: function(url, method, parameters) {
        var params = this.getParameters(url, method, parameters);
        var header = 'OAuth realm=""';
        for (var key in params) {
            header += ', ' + key + '="' + params[key] + '"';
        }
        return header;
    },

    /* Get an OAuth message represented as an object like this:
     * { method: "GET", action: "http://server.com/path", parameters: ... }
     * Look into oauth.js for details
     */
    getMessage: function(url, method, parameters) {
        var token = this.isAuthenticated() ? this.accessToken : this.requestToken;
        var accessor = { consumerSecret: this.api.secret,
                         tokenSecret: token.secret };
        var parameters = $.extend({
            oauth_consumer_key: this.api.key,
            oauth_token: this.accessToken.key,
            oauth_signature_method: 'HMAC-SHA1',
            oauth_version: '1.0'
        }, parameters || {});
        var message = {
            action: url,
            method: method,
            parameters: parameters
        };
        OAuth.setTimestampAndNonce(message);
        OAuth.SignatureMethod.sign(message, accessor);
        return message;
    },

    /* Get Oauth paramters
     * @param url       URL string 
     * @param type      'GET' or 'POST'
     * @param data      Parameter object
     *
     * @return          Parameter object
     */
    getParameters: function(url, method, parameters) {
        var message = this.getMessage(url, method, parameters);
        return OAuth.getParameterMap(message.parameters);
    },

    /* OAuth Request
     * @returns         null
     * @param           url String 
     * @param           data Dict 
     * @param           callback Function
     */
    oauthRequest: function(url, data, callback) {
        var data = this.getParameters(url, 'GET', data);
        this._http({ async: false, url: url, data: data, success: callback });
    }
});

/* A simple token object */
function Token(key, secret) {
    this.key = key || '';
    this.secret = secret || '';
}
// }}}

})(jQuery);
