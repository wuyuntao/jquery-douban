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
const GET_PEOPLE_URL = PEOPLE_URL  + '/{ID}';
const GET_CURRENT_URL = PEOPLE_URL  + '/%40me';     // %40 => @

const NOTE_URL = API_HOST + '/note';
const GET_NOTE_URL = NOTE_URL + '/{ID}';
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
const GET_REVIEW_URL = REVIEW_URL + '/{ID}';
const GET_USER_REVIEW_URL = GET_PEOPLE_URL + '/reviews';
const GET_BOOK_REVIEW_URL = GET_BOOK_URL + '/reviews';
const GET_MOVIE_REVIEW_URL = GET_MOVIE_URL + '/reviews';
const GET_MUSIC_REVIEW_URL = GET_MUSIC_URL + '/reviews';
const ADD_REVIEW_URL = REVIEW_URL + 's';
const UPDATE_REVIEW_URL = GET_REVIEW_URL;
const DELETE_REVIEW_URL = GET_REVIEW_URL;

const COLLECTION_URL = API_HOST + '/collection';
const GET_COLLECTION_URL = COLLECTION_URL + '/{ID}';
const GET_USER_COLLECTION_URL = GET_PEOPLE_URL + '/collections';
const ADD_COLLECTION_URL = COLLECTION_URL;
const UPDATE_COLLECTION_URL = GET_COLLECTION_URL;
const DELETE_COLLECTION_URL = GET_COLLECTION_URL;

const MINIBLOG_URL = API_HOST + '/miniblog';
const GET_MINIBLOG_URL = MINIBLOG_URL + '/{ID}';
const GET_USER_MINIBLOG_URL = GET_PEOPLE_URL + '/miniblog';
const GET_CONTACTS_MINIBLOG_URL = GET_PEOPLE_URL + '/miniblog/contacts';
const ADD_MINIBLOG_URL = MINIBLOG_URL + '/saying';
const DELETE_MINIBLOG_URL = GET_MINIBLOG_URL;
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
            date[i] = parseInt(date[i], 10);
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

/* Douban service
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
        this._client = $.douban('client', { apiKey: this.api.key,
                                            apiSecret: this.api.secret,
                                            type: this.options.httpType });
        var services = {
            'user': UserService,
            'note': NoteService,
            'book': BookService,
            'movie': MovieService,
            'music': MusicService,
            'review': ReviewService,
            'collection': CollectionService,
            'miniblog': MiniblogService,
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

/* Base class of all Douban API services
 */
var BaseService = $.class({
    init: function(service) {
        this._service = service;
    },

    /* Get URL from ID, API URL or object
     * @returns url
     * @param   obj Object or String
     * @param   tmpl String (optional);
     */
    lazyUrl: function(obj, tmpl) {
        if (typeof obj == 'object') return obj.id;
        else if (obj.match(/^\w+$/) && tmpl) return tmpl.replace(/\{ID\}/, obj);
        else return obj;
    },

    /* Get URL of subject
     * returns  url
     * @param   subject Object or String
     */
    lazySubject: function(subject) {
        if (typeof subject == 'object') return subject.id;
        else return subject;
    },

    /* Get new object from given object or url
     * @returns     new object, Object or undefined
     * @param       object, Object or String
     * @param       model, Constructor
     * @param       templateUrl, String
     */
    _get: function(object, model, templateUrl) {
        var url = this.lazyUrl(object, templateUrl);
        var json = this._service.get(url);
        return this._response(json, model);
    },

    /* Get object entries from given object
     * @returns     new object entries, Object or undefined
     * @param       object, Object or String
     * @param       model, Constructor
     * @param       templateUrl, String
     * @param       suffix, String
     * @param       offset, Integer
     * @param       limit, Integer
     */
    _getForObject: function(object, offset, limit, model, templateUrl, suffix, extraParams) {
        var url = this.lazyUrl(object, templateUrl) + suffix;
        var params = $.extend({ 'start-index': (offset || 0) + 1, 'max-results': limit || 50 }, extraParams);
        var json = this._service.get(url, params);
        return this._response(json, model);
    },

    /* Search object from given query
     * @returns     new object entries, Object or undefined
     * @param       url, String
     * @param       model, Constructor
     * @param       query, String
     * @param       offset, Integer
     * @param       limit, Integer
     */
    _search: function(query, offset, limit, url, model) {
        var params = { 'q': query,
                       'start-index': (offset || 0) + 1,
                       'max-results': limit || 50 };
        var json = this._service.get(url, params);
        return this._response(json, model);
    },

    /* Add object 
     * @returns     object created, Object or undefined
     * @param       url, String
     * @param       model, Constructor
     * @param       data, Dict or XML String
     */
    _add: function(data, url, model) {
        if (typeof data == 'object') data = model.createXml(data);
        var json = this._service.post(url, data);
        return this._response(json, model);
    },

    /* Update object 
     * @returns     object updated, Object or undefined
     * @param       object, Object or String
     * @param       model, Constructor
     * @param       templateUrl, String
     * @param       data, Dict or XML String
     */
    _update: function(object, data, model, templateUrl) {
        var url = this.lazyUrl(object, templateUrl);
        if (typeof data == 'object') data = model.createXml(data);
        var json = this._service.put(url, data);
        return this._response(json, model);
    },

    /* Delete object
     * @returns     if object is deleted, Boolean
     * @param       object, Object or String
     * @param       templateUrl, String
     */
    _delete: function(object, templateUrl) {
        var url = this.lazyUrl(object, templateUrl);
        var response = this._service.delete(url);
        console.debug(response);
        return response == 'OK' ? true : false;
    },

    /* Get response or undefined
     * @returns     new object or undefined
     * @param       json, Object
     * @param       model, Contructor
     */
    _response: function(json, model) {
        return json ? new model(json) : undefined;
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
    get: function(user) {
        return this._get(user, User, GET_PEOPLE_URL);
    },

    search: function(query, offset, limit) {
        return this._search(query, offset, limit, SEARCH_PEOPLE_URL, UserEntries);
    },

    current: function() {
        return this._get(GET_CURRENT_URL, User);
    },

    friends: function(user, offset, limit) {
        return this._getForObject(user, offset, limit, UserEntries, GET_PEOPLE_URL, '/friends');
    },

    contacts: function(user, offset, limit) {
        return this._getForObject(user, offset, limit, UserEntries, GET_PEOPLE_URL, '/contacts');
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
        return this._get(note, Note, GET_NOTE_URL);
    },

    getForUser: function(user, offset, limit) {
        return this._getForObject(user, offset, limit, NoteEntries, GET_PEOPLE_URL, '/notes');
    },

    add: function(data) {
        return this._add(data, ADD_NOTE_URL, Note);
    },

    update: function(note, data) {
        return this._update(note, data, Note, UPDATE_NOTE_URL);
    },

    delete: function(note) {
        return this._delete(note, DELETE_NOTE_URL);
    }
});

// Base class of book, movie and music service
var SubjectService = $.class(BaseService, {
    get: function(subject) {
        return this._get(subject, this._model, this._getSubjectUrl);
    },
    search: function(query, offset, limit) {
        return this._search(query, offset, limit, this._searchSubjectUrl, this._modelEntries);
    }
});

/* Douban Book API Service
 * @method      get         获取书籍信息
 * @method      search      搜索书籍
 */
var BookService = $.class(SubjectService, {
    init: function($super, service) {
        this._model = Book;
        this._modelEntries = BookEntries;
        this._getSubjectUrl = GET_BOOK_URL;
        this._searchSubjectUrl = SEARCH_BOOK_URL;
        $super(service);
    }
});

/* Douban Movie API Service
 * @method      get         获取电影信息
 * @method      search      搜索电影
 */
var MovieService = $.class(SubjectService, {
    init: function($super, service) {
        this._model = Movie;
        this._modelEntries = MovieEntries;
        this._getSubjectUrl = GET_MOVIE_URL;
        this._searchSubjectUrl = SEARCH_MOVIE_URL;
        $super(service);
    }
});

/* Douban Music API Service
 * @method      get         获取音乐信息
 * @method      search      搜索音乐
 */
var MusicService = $.class(SubjectService, {
    init: function($super, service) {
        this._model = Music;
        this._modelEntries = MusicEntries;
        this._getSubjectUrl = GET_MUSIC_URL;
        this._searchSubjectUrl = SEARCH_MUSIC_URL;
        $super(service);
    }
});

/* Douban Review API Service
 * @method      get             获取评论信息
 * @method      getForUser      特定用户的所有评论
 * @method      getForSubject   特定书籍、电影、音乐的所有评论
 * @method      add             发布新评论
 * @method      update          修改评论
 * @method      delete          删除评论
     */
var ReviewService = $.class(BaseService, {
    get: function(review) {
        return this._get(review, Review, GET_REVIEW_URL);
    },

    getForUser: function(user, offset, limit) {
        return this._getForObject(user, offset,limit, ReviewForUserEntries, GET_PEOPLE_URL, '/reviews');
    },

    getForSubject: function(subject, offset, limit) {
        // ``subject`` can be object or api url, but not id only
        return this._getForObject(subject, offset, limit, ReviewForSubjectEntries, null, '/reviews');
    },

    add: function(data) {
        return this._add(data, ADD_REVIEW_URL, Review);
    },

    update: function(review, data) {
        return this._update(review, data, Review, UPDATE_REVIEW_URL);
    },

    delete: function(review) {
        return this._delete(review, DELETE_REVIEW_URL);
    }
});

/* Douban Collection API Service
 * @method      get             获取收藏信息
 * @method      getForUser      获取用户收藏信息
 * @method      add             添加收藏
 * @method      update          更新收藏信息
 * @method      delete          删除收藏
 */
var CollectionService = $.class(BaseService, {
    get: function(collection) {
        return this._get(collection, Collection, GET_COLLECTION_URL);
    },

    getForUser: function(user, offset, limit, type) {
        return this._getForObject(user, offset, limit, CollectionEntries, GET_PEOPLE_URL, '/collection', { 'cat': type });
    },

    add: function(data) {
        return this._add(data, ADD_COLLECTION_URL, Collection);
    },

    update: function(collection, data) {
        return this._update(collection, data, Collection, UPDATE_COLLECTION_URL);
    },

    delete: function(collection) {
        return this._delete(collection, DELETE_COLLECTION_URL);
    }
});

/* Douban Miniblog API Service
 * @method      getForUser          获取用户广播
 * @method      getForContact       获取用户友邻广播
 * @method      add                 添加广播
 * @method      delete              删除广播
 */
var MiniblogService = $.class(BaseService, {
    getForUser: function(user, offset, limit) {
        return this._getForObject(user, offset, limit, MiniblogEntries, GET_PEOPLE_URL, '/miniblog');
    },

    getForContacts: function(user, offset, limit) {
        return this._getForObject(user, offset, limit, MiniblogEntries, GET_PEOPLE_URL, '/miniblog/contacts');
    },

    add: function(data) {
        return this._add(data, ADD_MINIBLOG_URL, Miniblog);
    },

    delete: function(miniblog) {
        return this._delete(miniblog, DELETE_MINIBLOG_URL);
    }
});

/* Douban Event API Service
 * @method      get             获取活动
 * @method      getUser         获取用户的所有活动
 * @method      getCity         获取城市的所有活动
 * @method      search          搜索活动
 * @method      join            参加活动
 * @method      add             创建新活动
 * @method      update          更新活动
 * @method      delete          删除活动
 */
var EventService = $.class(BaseService, {
    get: function(id) {
        throw new Error("Not Implemented Yet");
    },

    getForUser: function(id) {
        throw new Error("Not Implemented Yet");
    },

    getForCity: function(id) {
        throw new Error("Not Implemented Yet");
    },

    search: function(id) {
        throw new Error("Not Implemented Yet");
    },

    join: function(id) {
        throw new Error("Not Implemented Yet");
    },

    add: function(id) {
        throw new Error("Not Implemented Yet");
    },

    update: function(id) {
        throw new Error("Not Implemented Yet");
    },

    delete: function(name) {
        throw new Error("Not Implemented Yet");
    }
});

/* Douban Recommendation API Service
 * @method      get             获取推荐
 * @method      getUser         获取用户的所有推荐
 * @method      add             发表新推荐
 * @method      delete          删除推荐
 * @method      getReply        获取推荐回复
 * @method      addReply        发表新回复
 * @method      deleteReply     删除回复
 */
var RecommendationService = $.class(BaseService, {
    get: function(id) {
        throw new Error("Not Implemented Yet");
    },

    getForUser: function(id) {
        throw new Error("Not Implemented Yet");
    },

    add: function(id) {
        throw new Error("Not Implemented Yet");
    },

    delete: function(name) {
        throw new Error("Not Implemented Yet");
    },

    addReply: function(id) {
        throw new Error("Not Implemented Yet");
    },

    updateReply: function(id) {
        throw new Error("Not Implemented Yet");
    },

    deleteReply: function(name) {
        throw new Error("Not Implemented Yet");
    }
});

/* Douban Tag API Service
 * @method      getForSubject      某个书籍、电影、音乐中标记最多的标签
 * @method      getForUser         用户对书籍、电影、音乐标记的所有标签
*/
var TagService = $.class(BaseService, {
    getForSubject: function(id) {
        throw new Error("Not Implemented Yet");
    },

    getForUser: function(name) {
        throw new Error("Not Implemented Yet");
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
        return this.getAttr('id') || this.getUrl('self');
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

    getSubject: function() {
        if (!this._feed || !this._feed['db:subject']) return;
        return Subject.factory(this._feed['db:subject']);
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
        if (!this._feed || !this._feed['db:tag']) return [];
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
 * @param       data, Object
 * @data        title String
 * @data        content String
 * @data        isPublic Boolean (optional)
 * @data        isReplyEnabled Boolean (optional)
 */
Note.createXml = function(data) {
    data = $.extend({ title: '', content: '', isPublic: true,
                      isReplyEnabled: true },
                    data || {});
    var xml = '<?xml version="1.0" encoding="UTF-8"?><entry xmlns="http://www.w3.org/2005/Atom" xmlns:db="http://www.douban.com/xmlns/"><title>{TITLE}</title><content>{CONTENT}</content><db:attribute name="privacy">{IS_PUBLIC}</db:attribute><db:attribute name="can_reply">{IS_REPLY_ENABLED}</db:attribute></entry>';
    return xml.replace(/\{TITLE\}/, data.title)
              .replace(/\{CONTENT\}/, data.content)
              .replace(/\{IS_PUBLIC\}/, data.isPublic ? 'public' : 'private')
              .replace(/\{IS_REPLY_ENABLED\}/, data.isReplyEnabled ? 'yes' : 'no');
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
    }
});
// Class methods
/* create POST or PUT xml
 * @param       data, Object
 * @data        review, Object or String
 * @data        title, String
 * @data        content, String
 * @data        rating, Integer
 */
Review.createXml = function(data) {
    data = $.extend({ subject: '', title: '', content: '', rating: 3 },
                    data || {});
    if (typeof data.subject == 'object') var id = data.subject.id;
    else var id = data.subject;
    var xml = '<?xml version="1.0" encoding="UTF-8"?><entry xmlns:ns0="http://www.w3.org/2005/Atom"><db:subject xmlns:db="http://www.douban.com/xmlns/"><id>{ID}</id></db:subject><content>{CONTENT}</content><gd:rating xmlns:gd="http://schemas.google.com/g/2005" value="{RATING}" ></gd:rating><title>{TITLE}</title></entry>';
    return xml.replace(/\{ID\}/, id)
              .replace(/\{TITLE\}/, data.title)
              .replace(/\{CONTENT\}/, data.content)
              .replace(/\{RATING\}/, data.rating);
};

var ReviewForUserEntries = $.class(AuthorEntries, {
    createFromJson: function($super) {
        $super(Review);
    }
});

var ReviewForSubjectEntries = $.class(SubjectEntries, {
    createFromJson: function($super) {
        $super(Review);
    }
});

var Collection = $.class(DoubanObject, {
    createFromJson: function() {
        this.id = this.getId();
        this.title = this.getTitle();
        this.owner = this.getAuthor();
        this.content = this.getSummary();
        this.updated = this.getUpdated();
        this.subject = this.getSubject();
        this.status = this.getStatus();
        this.tags = this.getTags();
        this.rating = this.getRating();
    },

    getStatus: function() {
        return this.getAttr('db:status');
    }
});
// Class methods
/* create POST or PUT xml
 * @param       data, Object
 * @data        subject, Object or String
 * @data        status, String
 * @data        content, String
 * @data        rating, Integer or String
 * @data        tags, List
 * @data        isPrivate, Boolean
 */
Collection.createXml = function(data) {
    data = $.extend({ subject: '', status: '', content: '', rating: 3,
                      tags: [], isPrivate: false },
                    data || {});
    if (typeof data.subject == 'object') var id = data.subject.id;
    else var id = data.subject;
    var xml = '<?xml version="1.0" encoding="UTF-8"?><entry xmlns:ns0="http://www.w3.org/2005/Atom" xmlns:db="http://www.douban.com/xmlns/"><db:subject><id>{ID}</id></db:subject><db:status>{STATUS}</db:status>{TAGS}<content>{CONTENT}</content><gd:rating xmlns:gd="http://schemas.google.com/g/2005" value="{RATING}" ></gd:rating><db:attribute name="privacy">{IS_PRIVATE}</db:attribute></entry>';
    for (var i = 0, tags = '', len = data.tags.length; i < len; i++) {
        tags += '<db:tag name="' + data.tags[i] + '"></db:tag>';
    }
    return xml.replace(/\{ID\}/, id)
              .replace(/\{STATUS\}/, data.status)
              .replace(/\{CONTENT\}/, data.content)
              .replace(/\{RATING\}/, data.rating)
              .replace(/\{TAGS\}/, tags)
              .replace(/\{IS_PRIVATE\}/, data.isPrivate ? 'private' : 'public');
};

var CollectionEntries = $.class(AuthorEntries, {
    createFromJson: function($super) {
        $super(Collection);
    }
});

var Miniblog = $.class(DoubanObject, {
    createFromJson: function() {
        this.id = this.getId();
        this.title = this.getTitle()
        this.content = this.getContent();
        this.published = this.getPublished();
        this.category = this.getCategory();
        this.iconUrl = this.getIconUrl();
    },

    getCategory: function() {
        if (!this._feed || !this._feed['category']) return;
        return this._feed['category'][0]['@term'].match(/\.(\w+)$/)[1];
    }
});
Miniblog.createXml = function(data) {
    data = $.extend({ content: '' }, data || {});
    var xml = '<?xml version="1.0" encoding="UTF-8"?><entry xmlns:ns0="http://www.w3.org/2005/Atom" xmlns:db="http://www.douban.com/xmlns/"><content>{CONTENT}</content></entry>';
    return xml.replace(/\{CONTENT\}/, data.content);
};

var MiniblogEntries = $.class(AuthorEntries, {
    createFromJson: function($super) {
        $super(Collection);
    }
});

/* A simple tag object */
function Tag(name, count) {
    this.name = name;
    this.count = count;
}
// }}}

/* {{{ OAuth client
 * @usage
 * var apiToken = { apiKey: 'blah', apiSecret: 'blah' };
 * var client = $.douban('client', { apiKey: 'blah', apiSecret: 'blah' });
 * var requestToken = client.getRequestToken();
 * var url = client.getAuthorizationUrl(requestToken);
 * var accessToken = client.getAccessToken(requestToken);
 * var login = client.login(accessToken);
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

// {{{ jQuery Douban
/* Model dict for factory method
 */
var factoryDict = {
    'service': DoubanService,
    'client': OAuthClient,
    'book': Book,
    'movie': Movie,
    'music': Music,
    'user': User,
    'note': Note,
    'review': Review,
    'collection': Collection,
    'miniblog': Miniblog,
};

/* Factory method of jQuery Douban
 * @returns     Douban objects
 * @param       factory, String
 * @param       options, Object
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
    if (factory == 'http')
        return $.douban.http.factory(options);
    return new factoryDict[factory](options);
};
/* Create XML by given factory
 * @returns     XML String
 * @param       factory, String
 * @param       data, Object
 */
$.douban.createXml = function(factory, data) {
    return factoryDict[factory].createXml(data);
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

})(jQuery);
