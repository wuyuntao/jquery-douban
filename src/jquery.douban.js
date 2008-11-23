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
// API Bug => http://www.douban.com/group/topic/4655057/ 
const SEARCH_PEOPLE_URL = PEOPLE_URL + '/';
const GET_PEOPLE_URL = PEOPLE_URL  + '/{ID}';
const GET_CURRENT_URL = PEOPLE_URL  + '/%40me';     // %40 => @

const NOTE_URL = API_HOST + '/note';
const GET_NOTE_URL = NOTE_URL + '/{ID}';
const ADD_NOTE_URL = API_HOST + '/notes';

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
const ADD_REVIEW_URL = REVIEW_URL + 's';

const COLLECTION_URL = API_HOST + '/collection';
const GET_COLLECTION_URL = COLLECTION_URL + '/{ID}';
const ADD_COLLECTION_URL = COLLECTION_URL;

const MINIBLOG_URL = API_HOST + '/miniblog';
const GET_MINIBLOG_URL = MINIBLOG_URL + '/{ID}';
const ADD_MINIBLOG_URL = MINIBLOG_URL + '/saying';

const RECOMMENDATION_URL = API_HOST + '/recommendation';
const GET_RECOMMENDATION_URL = RECOMMENDATION_URL + '/{ID}';
const ADD_RECOMMENDATION_URL = RECOMMENDATION_URL + 's';
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
            'recommendation': RecommendationService,
        }
        for (var name in services) {
            this[name] = new services[name](this);
        }
    },

    /* Adapter methods of client
     */
    login: function(accessToken) {
        return this._client.login(accessToken);
    },

    getRequestToken: function() {
        return this._client.getRequestToken();
    },

    getAuthorizationUrl: function(requestToken, callbackUrl) {
        return this._client.getAuthorizationUrl(requestToken, callbackUrl);
    },

    getAccessToken: function(requestToken) {
        return this._client.getAccessToken(requestToken);
    },

    isAuthenticated: function() {
        return this._client.isAuthenticated();
    },

    /* HTTP methods */
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
        return this._sendData(url, data, callback, 'POST')
    },

    put: function(url, data, callback) {
        return this._sendData(url, data, callback, 'PUT')
    },

    _sendData: function(url, data, callback, type) {
        var json = null;
        var params = this.setParams();
        var setHeaders = this.setHeaders(url, type, params);
        var url = url + '?' + $.param(params);
        this._http({ async: false,
                     url: url,
                     data: data,
                     dataType: 'json',
                     type: type,
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

/* Base class of Douban API services provides basic access methods
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
        var params = $.extend({ 'start-index': (offset || 0) + 1,
                                'max-results': limit || 50 },
                              extraParams || {});
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

/* Template class of Douban services providing mostly used methods
 * like ``get``, ``getForUser``, ``add``, ``update`` and ``delete``.
 * These methods could be redefined or undefined in subclasses.
 * Following attributes should be defined in the ``init`` function
 * of the subclass.
 * @attribute   _model
 * @attribute   _modelEntry
 * @attribute   _suffix
 * @attribute   _getObjectUrl
 * @attribute   _addObjectUrl
 * 
 * Following methods are provided. If any one is not needed, undefine
 * them in the ``init`` function.
 * @method      get
 * @method      getForUser
 * @method      add
 * @method      update
 * @method      delete
 */
var CommonService = $.class(BaseService, {
    get: function(object) {
        return this._get(object, this._model, this._getObjectUrl);
    },

    getForUser: function(user, offset, limit, extraParams) {
        return this._getForObject(user, offset, limit, this._modelEntry, GET_PEOPLE_URL, this._suffix, extraParams);
    },

    add: function(data) {
        return this._add(data, this._addObjectUrl, this._model);
    },

    update: function(object, data) {
        return this._update(object, data, this._model, this._getObjectUrl);
    },

    delete: function(object) {
        return this._delete(object, this._getObjectUrl);
    }
});

/* Template class of Douban subject services providing same methods
 * like ``get`` and ``search``.
 * Following attributes should be defined in the ``init`` function
 * of the subclass.
 * @attribute   _model
 * @attribute   _modelEntry
 * @attribute   _getSubjectUrl
 * @attribute   _searchSubjectUrl
 *
 * Following methods are provided.
 * @method      get
 * @method      search
 */
var SubjectService = $.class(BaseService, {
    get: function(subject) {
        return this._get(subject, this._model, this._getSubjectUrl);
    },

    search: function(query, offset, limit) {
        return this._search(query, offset, limit, this._searchSubjectUrl, this._modelEntry);
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
        return this._search(query, offset, limit, SEARCH_PEOPLE_URL, UserEntry);
    },

    current: function() {
        return this._get(GET_CURRENT_URL, User);
    },

    friends: function(user, offset, limit) {
        return this._getForObject(user, offset, limit, UserEntry, GET_PEOPLE_URL, '/friends');
    },

    contacts: function(user, offset, limit) {
        return this._getForObject(user, offset, limit, UserEntry, GET_PEOPLE_URL, '/contacts');
    }
});

/* Douban Note API Service
 * @method      get             获取日记
 * @method      getForUser      获取用户的所有日记
 * @method      add             发表新日记
 * @method      update          更新日记
 * @method      delete          删除日记
 */
var NoteService = $.class(CommonService, {
    init: function($super, service) {
        this._model = Note;
        this._modelEntry = NoteEntry;
        this._getObjectUrl = GET_NOTE_URL;
        this._addObjectUrl = ADD_NOTE_URL;
        this._suffix = '/notes';
        $super(service);
    }
});

/* Douban Book API Service
 * @method      get         获取书籍信息
 * @method      search      搜索书籍
 */
var BookService = $.class(SubjectService, {
    init: function($super, service) {
        this._model = Book;
        this._modelEntry = BookEntry;
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
        this._modelEntry = MovieEntry;
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
        this._modelEntry = MusicEntry;
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
var ReviewService = $.class(CommonService, {
    init: function($super, service) {
        this._model = Review;
        this._modelEntry = ReviewForUserEntry;
        this._getObjectUrl = GET_REVIEW_URL;
        this._addObjectUrl = ADD_REVIEW_URL;
        this._suffix = '/reviews';
        $super(service);
    },

    getForSubject: function(subject, offset, limit) {
        subject = this.lazyUrl(subject);
        return this._getForObject(subject, offset, limit, ReviewForSubjectEntry, null, '/reviews');
    }
});

/* Douban Collection API Service
 * @method      get             获取收藏信息
 * @method      getForUser      获取用户收藏信息
 * @method      add             添加收藏
 * @method      update          更新收藏信息
 * @method      delete          删除收藏
 */
var CollectionService = $.class(CommonService, {
    init: function($super, service) {
        this._model = Collection;
        this._modelEntry = CollectionEntry;
        this._getObjectUrl = GET_COLLECTION_URL;
        this._addObjectUrl = ADD_COLLECTION_URL;
        this._suffix = '/collection';
        $super(service);
    },

    getForUser: function(user, offset, limit, type) {
        return this._getForObject(user, offset, limit, CollectionEntry, GET_PEOPLE_URL, '/collection', { 'cat': type });
    }
});

/* Douban Miniblog API Service
 * @method      getForUser          获取用户广播
 * @method      getForContact       获取用户友邻广播
 * @method      add                 添加广播
 * @method      delete              删除广播
 */
var MiniblogService = $.class(CommonService, {
    init: function($super, service) {
        this._model = Miniblog;
        this._modelEntry = MiniblogEntry;
        this._getObjectUrl = GET_MINIBLOG_URL;
        this._addObjectUrl = ADD_MINIBLOG_URL;
        this._suffix = '/miniblog';
        // Mask ``get`` and ``update`` method
        this.get = undefined;
        this.udpate = undefined;
        $super(service);
    },

    getForContacts: function(user, offset, limit) {
        return this._getForObject(user, offset, limit, this._modelEntry, GET_PEOPLE_URL, '/miniblog/contacts');
    }
});

/* Douban Event API Service
 * @method      get             获取活动
 * @method      getForUser      获取用户的所有活动
 * @method      getForCity      获取城市的所有活动
 * @method      search          搜索活动
 * @method      join            参加活动
 * @method      add             创建新活动
 * @method      update          更新活动
 * @method      delete          删除活动
 */
var EventService = $.class(CommonService, {
    init: function($super, service) {
        this._model = Event;
        this._modelEntry = EventEntry;
        this._getObjectUrl = GET_EVENT_URL;
        this._addObjectUrl = ADD_EVENT_URL;
        this._suffix = '/events';
        $super(service);
    },

    getForCity: function(id) {
        return this._getForObject(user, offset, limit, this._modelEntry, GET_PEOPLE_URL, '/miniblog/contacts');
    },

    search: function(id) {
        throw new Error("Not Implemented Yet");
    },

    join: function(id) {
        throw new Error("Not Implemented Yet");
    }
});

/* Douban Recommendation API Service
 * @method      get             获取推荐
 * @method      getForUser      获取用户的所有推荐
 * @method      add             发表新推荐
 * @method      delete          删除推荐
 * @method      getComment      获取推荐回复
 * @method      addComment      发表新回复
 * @method      deleteComment   删除回复
 */
var RecommendationService = $.class(CommonService, {
    init: function($super, service) {
        this._model = Recommendation;
        this._modelEntry = RecommendationEntry;
        this._getObjectUrl = GET_RECOMMENDATION_URL;
        this._addObjectUrl = ADD_RECOMMENDATION_URL;
        this._suffix = '/recommendations';
        // Mask ``update`` method
        this.update = undefined;
        $super(service);
    },

    getComment: function(recommendation, offset, limit) {
        return this._getForObject(recommendation, offset, limit, CommentEntry, GET_RECOMMENDATION_URL, '/comments');
    },

    addComment: function(recommendation, data) {
        var url = this.lazyUrl(recommendation, GET_RECOMMENDATION_URL) + '/comments';
        return this._add(data, url, Comment);
    },

    deleteComment: function(comment) {
        return this._delete(comment);
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
        for (var i = 0, len = this.all.length; i < len; i++) {
            var name = this.all[i];
            this[name] = this._getAttribute(name);
        }
    },

    /* Get read-only json feed
     */
    getFeed: function() {
        return this._feed;
    },

    /* Update the feed and object
     */
    updateFeed: function(feed) {
        this._feed = feed;
        this.createFromJson();
    },

    _getAttribute: function(attr) {
        switch (attr) {
            case 'artists':
                return this.getAttrs('singer');
            case 'aka':
            case 'cast':
            case 'country':
            case 'language':
                return this.getAttrs(attr);
            case 'author':
            case 'owner':
                return this.getAuthor();
            case 'authors':
            case 'directors':
            case 'translators':
            case 'writers':
                return this.getAttrs(attr.slice(0, -1));
            case 'authorIntro':
                return this.getAttr('author-intro');
            case 'blog':
                return this.getUrl('homepage');
            case 'category':
                return this.getCategory();
            case 'chineseTitle':
                return this.getChineseTitle();
            case 'id':
                return this.getAttr('id') || this.getUrl('self');
            case 'intro':
                return this.getAttr('content');
            case 'imageUrl':
                return this.getUrl('image') || this.getUrl('icon');
            case 'isPublic':
                return this.getAttr('privacy') == 'public' ? true : false;
            case 'isReplyEnabled':
                return this.getAttr('can_reply') == 'yes' ? true : false;
            case 'location':
            case 'status':
                return this.getAttr('db:' + attr);
            case 'published':
            case 'updated':
                return this.getTime(attr);
            case 'rating':
                return this.getRating();
            case 'releaseDate':
                return this.getAttr('pubdate');
            case 'screenName':
                return this.getAttr('title') || this.getAttr('name');
            case 'subject':
                return this.getSubject();
            case 'tags':
                return this.getTags();
            case 'type':
                return this.getAttr('category');
            case 'url':
                return this.getUrl();
            case 'userName':
                return this.getAttr('db:uid');
            case 'votes':
                return this.getVotes();
            default:
                return this.getAttr(attr);
        }
    },

    /* JSON feed parsers
     */
    // Get the attribute
    getAttr: function (attr) {
        if (!this._feed) return;
        if (this._feed[attr]) return this._feed[attr]['$t'];
        var attrs = this._feed['db:attribute'];
        if (attrs)
            for (var i in attrs)
                if (attrs[i]['@name'] == attr) return attrs[i]['$t'];
    },

    // Get a list of attributes
    getAttrs: function(name) {
        if (!this._feed || !this._feed['db:attribute']) return;
        var attrs = [], feedAttributes = this._feed['db:attribute'];
        for (var i = 0, len = feedAttributes.length; i < len; i++)
            if (feedAttributes[i]['@name'] == name)
                attrs.push(feedAttributes[i]['$t']);
        return attrs;
    },

    // Get the url
    getUrl: function(attr) {
        if (!this._feed) return;
        // default ``attr`` is 'alternate'
        attr = attr || 'alternate';
        var links = this._feed['link'];
        for (var i in links)
            if (links[i]['@rel'] == attr) return links[i]['@href'];
    },

    getCategory: function() {
        if (!this._feed || !this._feed['category']) return;
        return this._feed['category'][0]['@term'].match(/\.(\w+)$/)[1];
    },

    getChineseTitle: function() {
        if (!this._feed || !this._feed['db:attribute']) return;
        var attrs = this._feed['db:attribute'];
        for (var i = 0, len = attrs.length; i < len; i++)
            if (attrs[i]['@name'] == 'aka' && attrs[i]['@lang'] == 'zh_CN')
                return attrs[i]['$t'];
    },

    getAuthor: function() {
        if (this._feed && this._feed.author) return new User(this._feed.author);
    },

    getSubject: function() {
        if (!this._feed || !this._feed['db:subject']) return;
        return DoubanObject.subjectFactory(this._feed['db:subject']);
    },

    getTime: function(attr) {
        var time = this.getAttr(attr);
        return time ? $.parseDate(time) : undefined;
    },

    getRating: function() {
        if (!this._feed || !this._feed['gd:rating']) return;
        return parseFloat(this._feed['gd:rating']['@average'] || 
                          this._feed['gd:rating']['@value']);
    },

    getVotes: function() {
        if (!this._feed || !this._feed['gd:rating']) return;
        return this._feed['gd:rating']['@numRaters'];
    },

    getTags: function() {
        if (!this._feed || !this._feed['db:tag']) return [];
        var tags = [], entries = this._feed['db:tag'];
        for (var i = 0, len = entries.length; i < len; i++)
            tags.push(new Tag(entries[i]['@name'], entries[i]['@count']));
        return tags;
    }
});
// Class method
/* Factory method of Douban books, movies and music
 */
DoubanObject.subjectFactory = function(json) {
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


var DoubanObjectEntry = $.class(DoubanObject, {
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

var AuthorEntry = $.class(DoubanObjectEntry, {
    createFromJson: function($super, doubanObject) {
        this.title = this.getAttr('title');
        this.author = this.getAuthor();
        $super(doubanObject);
    }
});

var SubjectEntry = $.class(DoubanObjectEntry, {
    createFromJson: function($super, doubanObject) {
        this.title = this.getAttr('title');
        $super(doubanObject);
    }
});

var SearchEntry = $.class(DoubanObjectEntry, {
    createFromJson: function($super, doubanObject) {
        this.title = this.getAttr('title');
        this.query = this.getAttr('title').replace(/^搜索\ /, '').replace(/\ 的结果$/, '');
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
 * @attribute       iamgeUrl        头像，"http://otho.douban.com/icon/u1000001-14.jpg"
 * @method          createFromJson  由豆瓣返回的用户JSON，初始化用户数据
 */
var User = $.class(DoubanObject, {
    createFromJson: function($super) {
        this.all = ['id', 'userName', 'screenName', 'location', 'blog', 'intro', 'url', 'imageUrl'];
        $super();
    },
});

/* Douban user entries
 * @param           data            Well-formatted json feed
 * @attribute       total
 * @attribute       offset
 * @attribute       limit
 * @attribute       entries
 * @method          createFromJson
 */
var UserEntry = $.class(SearchEntry, {
    createFromJson: function($super) {
        $super(User);
    }
});

/* Douban note
 * @param           data            Well-formatted json feed
 * @attribute       id              日记ID
 * @attribute       title           日记标题
 * @attribute       author          日记作者，User object
 * @attribute       summary         日记摘要，如果设为全文输出，则和content相同
 * @attribute       content         日记全文
 * @attribute       published       日记发布时间
 * @attribute       updated         日记最近更新时间
 * @attribute       url             日记网志
 * @attribute       isPublic        是否公开
 * @attribute       isReplyEnabled  是否允许回复
 * @method          createFromJson  由豆瓣返回的日记JSON，初始化日记数据
 */
var Note = $.class(DoubanObject, {
    createFromJson: function($super) {
        this.all = ['id', 'title', 'author', 'summary', 'content', 'published', 'updated', 'url', 'isPublic', 'isReplyEnabled'];
        $super();
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
var NoteEntry = $.class(AuthorEntry, {
    createFromJson: function($super) {
        $super(Note);
    }
});

var Book = $.class(DoubanObject, {
    createFromJson: function($super) {
        this.all = ['id', 'title', 'aka', 'subtitle', 'authors', 'translators', 'isbn10', 'isbn13', 'releaseDate', 'published', 'publisher', 'price', 'pages', 'binding', 'authorIntro', 'summary', 'url', 'imageUrl', 'tags', 'rating', 'votes'];
        $super();
    }
});

var BookEntry = $.class(SearchEntry, {
    createFromJson: function($super) {
        $super(Book);
    }
});

var Movie = $.class(DoubanObject, {
    createFromJson: function($super) {
        this.all = ['id', 'title', 'chineseTitle', 'aka', 'directors', 'writers', 'cast', 'imdb', 'releaseDate', 'episode', 'language', 'country', 'summary', 'url', 'imageUrl', 'website', 'tags', 'rating', 'votes'];
        $super();
    }
});

var MovieEntry = $.class(SearchEntry, {
    createFromJson: function($super) {
        $super(Movie);
    }
});

var Music = $.class(DoubanObject, {
    createFromJson: function($super) {
        this.all = ['id', 'title', 'aka', 'artists', 'ean', 'releaseDate', 'publisher', 'media', 'discs', 'version', 'summary', 'tracks', 'url', 'imageUrl', 'tags', 'rating', 'votes'];
        $super();
    }
});

var MusicEntry = $.class(SearchEntry, {
    createFromJson: function($super) {
        $super(Music);
    }
});

var Review = $.class(DoubanObject, {
    createFromJson: function($super) {
        this.all = ['id', 'title', 'author', 'subject', 'summary', 'content', 'published', 'updated', 'url', 'rating'];
        $super();
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

var ReviewForUserEntry = $.class(AuthorEntry, {
    createFromJson: function($super) {
        $super(Review);
    }
});

var ReviewForSubjectEntry = $.class(SubjectEntry, {
    createFromJson: function($super) {
        $super(Review);
    }
});

var Collection = $.class(DoubanObject, {
    createFromJson: function($super) {
        this.all = ['id', 'title', 'owner', 'content', 'updated', 'subject', 'status', 'tags', 'rating'];
        $super();
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

var CollectionEntry = $.class(AuthorEntry, {
    createFromJson: function($super) {
        $super(Collection);
    }
});

var Miniblog = $.class(DoubanObject, {
    createFromJson: function($super) {
        this.all = ['id', 'title', 'content', 'published', 'category', 'type', 'imageUrl'];
        $super();
    }
});
Miniblog.createXml = function(data) {
    data = $.extend({ content: '' }, data || {});
    var xml = '<?xml version="1.0" encoding="UTF-8"?><entry xmlns:ns0="http://www.w3.org/2005/Atom" xmlns:db="http://www.douban.com/xmlns/"><content>{CONTENT}</content></entry>';
    return xml.replace(/\{CONTENT\}/, data.content);
};

var MiniblogEntry = $.class(AuthorEntry, {
    createFromJson: function($super) {
        $super(Collection);
    }
});

var Recommendation = $.class(DoubanObject, {
    createFromJson: function($super) {
        this.all = ['id', 'title', 'content', 'published', 'type', 'comment'];
        $super();
    }
});
Recommendation.createXml = function(data) {
    data = $.extend({ comment: '', title: '', url: '' }, data || {});
    var xml = '<?xml version="1.0" encoding="UTF-8"?><entry xmlns="http://www.w3.org/2005/Atom" xmlns:gd="http://schemas.google.com/g/2005" xmlns:opensearch="http://a9.com/-/spec/opensearchrss/1.0/" xmlns:db="http://www.douban.com/xmlns/"><title>{TITLE}</title><db:attribute name="comment">{COMMENT}</db:attribute><link href="{URL}" rel="related" /></entry>';
    return xml.replace(/\{COMMENT\}/, data.comment)
              .replace(/\{URL\}/, data.url)
              .replace(/\{TITLE\}/, data.title);
};

var RecommendationEntry = $.class(AuthorEntry, {
    createFromJson: function($super) {
        $super(Recommendation);
    }
});

var Comment = $.class(DoubanObject, {
    createFromJson: function($super) {
        this.all = ['id', 'author', 'published', 'content'];
        $super();
    }
});
Comment.createXml = function(data) {
    data = $.extend({ content: '' }, data || {});
    var xml = '<entry><content>{CONTENT}</content></entry>';
    return xml.replace(/\{CONTENT\}/, data.content);
}

var CommentEntry = $.class(AuthorEntry, {
    createFromJson: function($super) {
        $super(Comment);
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
    'recommendation': Recommendation
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
