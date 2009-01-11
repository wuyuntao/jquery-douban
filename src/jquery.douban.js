(function($) {
/* 
 * jQuery Douban
 *
 * Copyright (c) 2008 Wu Yuntao <http://blog.luliban.com/>
 * Licensed under the Apache 2.0 license.
 *
 */

// {{{ Douban authentication and API URLs
var AUTH_HOST = 'http://www.douban.com';
var REQUEST_TOKEN_URL = AUTH_HOST + '/service/auth/request_token';
var AUTHORIZATION_URL = AUTH_HOST + '/service/auth/authorize';
var ACCESS_TOKEN_URL = AUTH_HOST + '/service/auth/access_token';

var API_HOST = 'http://api.douban.com';
var PEOPLE_URL = API_HOST + '/people';
var GET_PEOPLE_URL = PEOPLE_URL  + '/{ID}';
var GET_CURRENT_URL = PEOPLE_URL  + '/%40me';     // %40 => @

var NOTE_URL = API_HOST + '/note';
var GET_NOTE_URL = NOTE_URL + '/{ID}';
var ADD_NOTE_URL = API_HOST + '/notes';

var BOOK_URL = API_HOST + '/book/subject';
var GET_BOOK_URL = BOOK_URL + '/{ID}';
var SEARCH_BOOK_URL = BOOK_URL + 's';

var MOVIE_URL = API_HOST + '/movie/subject';
var GET_MOVIE_URL = MOVIE_URL + '/{ID}';
var SEARCH_MOVIE_URL = MOVIE_URL + 's';

var MUSIC_URL = API_HOST + '/music/subject';
var GET_MUSIC_URL = MUSIC_URL + '/{ID}';
var SEARCH_MUSIC_URL = MUSIC_URL + 's';

var REVIEW_URL = API_HOST + '/review';
var GET_REVIEW_URL = REVIEW_URL + '/{ID}';
var ADD_REVIEW_URL = REVIEW_URL + 's';

var COLLECTION_URL = API_HOST + '/collection';
var GET_COLLECTION_URL = COLLECTION_URL + '/{ID}';
var ADD_COLLECTION_URL = COLLECTION_URL;

var MINIBLOG_URL = API_HOST + '/miniblog';
var GET_MINIBLOG_URL = MINIBLOG_URL + '/{ID}';
var ADD_MINIBLOG_URL = MINIBLOG_URL + '/saying';

var RECOMMENDATION_URL = API_HOST + '/recommendation';
var GET_RECOMMENDATION_URL = RECOMMENDATION_URL + '/{ID}';
var ADD_RECOMMENDATION_URL = RECOMMENDATION_URL + 's';

var EVENT_URL = API_HOST + '/event';
var GET_EVENT_URL = EVENT_URL + '/{ID}';
var ADD_EVENT_URL = EVENT_URL + 's';
var GET_EVENT_FOR_CITY_URL = EVENT_URL + '/location/{ID}';
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
    klass: function() {
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

    /* Parse datetime string to Date object, or vice versa
     */
    parseDate: function(datetime) {
        var re = /^(\d{4})\-(\d{2})\-(\d{2})T(\d{2}):(\d{2}):(\d{2})/;
        var tmpl = 'YY-MM-DDThh:mm:ss+08:00';
        if (typeof datetime == 'string') {
            var datetime = datetime.match(re);
            for (var i = 1, len = datetime.length; i < len; i++) {
                datetime[i] = parseInt(datetime[i], 10);
                if (i == 2) datetime[i] -= 1;
            }
            return new Date(datetime[1], datetime[2], datetime[3],
                            datetime[4], datetime[5], datetime[6]);
        } else if (typeof datetime == 'object') {
            return tmpl.replace(/YY/, $.padLeft(datetime.getFullYear()))
                       .replace(/MM/, $.padLeft(datetime.getMonth() + 1))
                       .replace(/DD/, $.padLeft(datetime.getDate()))
                       .replace(/hh/, $.padLeft(datetime.getHours()))
                       .replace(/mm/, $.padLeft(datetime.getMinutes()))
                       .replace(/ss/, $.padLeft(datetime.getSeconds()));
        } else {
            throw new Error("Invalid datetime. String or Date object needed");
        }
    },

    padLeft: function(val, digit) {
        return val.toString().length >= (digit || 2) ? String(val) : $.padLeft('0' + val, digit);
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
 * @option      key String
 * @option      secret String
 * @option      type String
 */
var DoubanService = $.klass({
    init: function(options) {
        var defaults = {
            key: '',
            secret: '',
            type: 'jquery',
            async: false
        };
        this.options = $.extend(defaults, options || {});;
        this.api = new Token(this.options.key, this.options.secret);

        this._http = $.douban.http.factory({ type: this.options.type });
        this._client = $.douban('client', this.options);
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
            'event': EventService,
            'tag': TagService
        };
        for (var name in services) {
            this[name] = new services[name](this);
        }
    },

    /* Adapter methods of client
     */
    login: function(accessToken) {
        return this._client.login(accessToken);
    },

    getRequestToken: function(callback) {
        return this._client.getRequestToken(callback);
    },

    getAuthorizationUrl: function(requestToken, callbackUrl) {
        return this._client.getAuthorizationUrl(requestToken, callbackUrl);
    },

    getAccessToken: function(requestToken, callback) {
        return this._client.getAccessToken(requestToken, callback);
    },

    isAuthenticated: function() {
        return this._client.isAuthenticated();
    },

    /* HTTP methods */
    GET: function(url, params, callback) {
		// shift arguments if params argument was ommited
		if ($.isFunction(params)) {
			callback = params;
			params = null;
		}
        var json = null;
        var params = this.setParams(params);
        var headers = this.getHeaders(url, 'GET', params);
        this._http({ async: this.options.async,
                     url: url,
                     type: 'GET',
                     data: params,
                     dataType: 'json',
                     headers: headers,
                     success: onSuccess });
        return json;

        function onSuccess(data) {
            json = data;
            if ($.isFunction(callback)) callback(data);
        }
    },

    POST: function(url, data, callback) {
        return this._sendData(url, data, callback, 'POST');
    },

    PUT: function(url, data, callback) {
        return this._sendData(url, data, callback, 'PUT');
    },

    _sendData: function(url, data, callback, type) {
        var json = null;
        var params = this.setParams();
        var headers = this.getHeaders(url, type, params);
        url += (url.match(/\?/) ? '&' : '?') + $.param(params);
        this._http({ async: this.options.async,
                     url: url,
                     data: data,
                     dataType: 'json',
                     type: type,
                     headers: headers,
                     success: onSuccess });
        return json;

        function onSuccess(data) {
            json = data;
            if ($.isFunction(callback)) callback(data);
        }
    },

    DELETE: function(url, callback) {
        var response = null;
        var params = this.setParams();
        var headers = this.getHeaders(url, 'DELETE', params);
        this._http({ async: this.options.async,
                     url: url,
                     type: 'DELETE',
                     data: params,
                     dataType: 'text',
                     headers: headers,
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

    /* Get headers for request
     * @returns     headers object
     * @param       url String
     * @param       type String. 'GET', 'PUT', 'POST' or 'DELETE'
     * @param       params Dict
     */
    getHeaders: function(url, type, params) {
        var headers = this._client.getAuthHeaders(url, type, params);
        return { 'Authorization': headers };
    }
});

/* Base class of Douban API services provides basic access methods
 */
var BaseService = $.klass({
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
     * @param       callback, Function
     * @param       model, Constructor
     * @param       templateUrl, String
     */
    _get: function(object, callback, model, templateUrl) {
        var url = this.lazyUrl(object, templateUrl);
        var json = this._service.GET(url, this._onSuccess(callback, model));
        return this._response(json, model);
    },

    /* Get object entries from given object
     * @returns     new object entries, Object or undefined
     * @param       object, Object or String
     * @param       offset, Integer
     * @param       limit, Integer
     * @param       callback, Function
     * @param       model, Constructor
     * @param       templateUrl, String
     * @param       suffix, String
     */
    _getForObject: function(object, offset, limit, callback, model, templateUrl, suffix, extraParams) {
        var url = this.lazyUrl(object, templateUrl) + suffix;
        var params = $.extend({ 'start-index': (offset || 0) + 1,
                                'max-results': limit || 50 },
                              extraParams || {});
        var json = this._service.GET(url, params, this._onSuccess(callback, model));
        return this._response(json, model);
    },

    /* Search object from given query
     * @returns     new object entries, Object or undefined
     * @param       url, String
     * @param       offset, Integer
     * @param       limit, Integer
     * @param       callback, Function
     * @param       model, Constructor
     * @param       query, String
     */
    _search: function(query, offset, limit, callback, url, model) {
        var params = { 'q': query,
                       'start-index': (offset || 0) + 1,
                       'max-results': limit || 50 };
        var json = this._service.GET(url, params, this._onSuccess(callback, model));
        return this._response(json, model);
    },

    /* Add object 
     * @returns     object created, Object or undefined
     * @param       data, Dict or XML String
     * @param       callback, Function
     * @param       url, String
     * @param       model, Constructor
     */
    _add: function(data, callback, url, model) {
        if (typeof data == 'object') data = model.createXml(data);
        var json = this._service.POST(url, data, this._onSuccess(callback, model));
        return this._response(json, model);
    },

    /* Update object 
     * @returns     object updated, Object or undefined
     * @param       object, Object or String
     * @param       data, Dict or XML String
     * @param       callback, Function
     * @param       model, Constructor
     * @param       templateUrl, String
     */
    _update: function(object, data, callback, model, templateUrl) {
        var url = this.lazyUrl(object, templateUrl);
        if (typeof data == 'object') data = model.createXml(data);
        var json = this._service.PUT(url, data, this._onSuccess(callback, model));
        return this._response(json, model);
    },

    /* Delete object
     * @returns     if object is removed, Boolean
     * @param       object, Object or String
     * @param       callback, Function
     * @param       templateUrl, String
     */
    _remove: function(object, callback, templateUrl) {
        var url = this.lazyUrl(object, templateUrl);
        var response = this._service.DELETE(url, this._onSuccess(callback));
        return response == 'OK' ? true : false;
    },

    _onSuccess: function(callback, model) {
        var self = this;
        return function(data) {
            if (typeof data == 'string') data == 'OK' ? true : false;
            else if (typeof data == 'object' && data['result'])
                data['result']['$t'] == 'OK' ? true : false;
            else data = self._response(data, model);
            if ($.isFunction(callback)) callback(data);
        }
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
 * like ``get``, ``getForUser``, ``add``, ``update`` and ``remove``.
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
 * @method      remove
 */
var CommonService = $.klass(BaseService, {
    get: function(object, callback) {
        return this._get(object, callback, this._model, this._getObjectUrl);
    },

    getForUser: function(user, offset, limit, callback, extraParams) {
        return this._getForObject(user, offset, limit, callback, this._modelEntry, GET_PEOPLE_URL, this._suffix, extraParams);
    },

    add: function(data, callback) {
        return this._add(data, callback, this._addObjectUrl, this._model);
    },

    update: function(object, data, callback) {
        return this._update(object, data, callback, this._model, this._getObjectUrl);
    },

    remove: function(object, callback) {
        return this._remove(object, callback, this._getObjectUrl);
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
var SubjectService = $.klass(BaseService, {
    get: function(subject, callback) {
        return this._get(subject, callback, this._model, this._getSubjectUrl);
    },

    search: function(query, offset, limit, callback) {
        return this._search(query, offset, limit, callback, this._searchSubjectUrl, this._modelEntry);
    }
});

/* Douban User API Service
 * @method      get             获取用户信息
 * @method      search          搜索用户
 * @method      current         获取当前授权用户信息
 * @method      friends         获取用户朋友
 * @method      contacts        获取用户关注的人
 */
var UserService = $.klass(BaseService, {
    get: function(user, callback) {
        return this._get(user, callback, User, GET_PEOPLE_URL);
    },

    search: function(query, offset, limit, callback) {
        return this._search(query, offset, limit, callback, PEOPLE_URL, UserEntry);
    },

    current: function(callback) {
        return this._get(GET_CURRENT_URL, callback, User);
    },

    friends: function(user, offset, limit, callback) {
        return this._getForObject(user, offset, limit, callback, UserEntry, GET_PEOPLE_URL, '/friends');
    },

    contacts: function(user, offset, limit, callback) {
        return this._getForObject(user, offset, limit, callback, UserEntry, GET_PEOPLE_URL, '/contacts');
    }
});

/* Douban Note API Service
 * @method      get             获取日记
 * @method      getForUser      获取用户的所有日记
 * @method      add             发表新日记
 * @method      update          更新日记
 * @method      remove          删除日记
 */
var NoteService = $.klass(CommonService, {
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
var BookService = $.klass(SubjectService, {
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
var MovieService = $.klass(SubjectService, {
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
var MusicService = $.klass(SubjectService, {
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
 * @method      remove          删除评论
 */
var ReviewService = $.klass(CommonService, {
    init: function($super, service) {
        this._model = Review;
        this._modelEntry = ReviewForUserEntry;
        this._getObjectUrl = GET_REVIEW_URL;
        this._addObjectUrl = ADD_REVIEW_URL;
        this._suffix = '/reviews';
        $super(service);
    },

    getForSubject: function(subject, offset, limit, callback) {
        return this._getForObject(subject, offset, limit, callback, ReviewForSubjectEntry, null, '/reviews');
    }
});

/* Douban Collection API Service
 * @method      get             获取收藏信息
 * @method      getForUser      获取用户收藏信息
 * @method      add             添加收藏
 * @method      update          更新收藏信息
 * @method      remove          删除收藏
 */
var CollectionService = $.klass(CommonService, {
    init: function($super, service) {
        this._model = Collection;
        this._modelEntry = CollectionEntry;
        this._getObjectUrl = GET_COLLECTION_URL;
        this._addObjectUrl = ADD_COLLECTION_URL;
        this._suffix = '/collection';
        $super(service);
    },

    getForUser: function(user, offset, limit, callback, type) {
        return this._getForObject(user, offset, limit, callback, CollectionEntry, GET_PEOPLE_URL, '/collection', { 'cat': type });
    }
});

/* Douban Miniblog API Service
 * @method      getForUser          获取用户广播
 * @method      getForContact       获取用户友邻广播
 * @method      add                 添加广播
 * @method      remove              删除广播
 */
var MiniblogService = $.klass(CommonService, {
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

    getForContacts: function(user, offset, limit, callback) {
        return this._getForObject(user, offset, limit, callback, this._modelEntry, GET_PEOPLE_URL, '/miniblog/contacts');
    }
});

/* Douban Event API Service
 * @method      get             获取活动
 * @method      getForUser      获取用户的所有活动
 * @method      add             创建新活动
 * @method      update          更新活动
 * @method      remove          删除活动
 * @method      search          搜索活动（未支持）
 * @method      getForCity      获取城市的所有活动（未支持）
 * @method      join            参加活动等（未支持）
 */
var EventService = $.klass(CommonService, {
    init: function($super, service) {
        this._model = Event;
        this._modelEntry = EventEntry;
        this._getObjectUrl = GET_EVENT_URL;
        this._addObjectUrl = ADD_EVENT_URL;
        this._suffix = '/events';
        $super(service);
    },

    search: function(query, location, offset, limit, callback) {
        var params = { 'q': query,
                       'location': location || 'all',
                       'start-index': (offset || 0) + 1,
                       'max-results': limit || 50 };
        var json = this._service.GET(this._addObjectUrl, params, this._onSuccess(callback, this._modelEntry));
        return this._response(json, this._modelEntry);
    },

    remove: function(event, data, callback) {
        if (!data || typeof data == 'object') data = this._model.createRemoveXml(data);
        var url = this.lazyUrl(event, this._getObjectUrl) + '/delete';
        var response = this._service.POST(url, data, this._onSuccess(callback));
        return (response['result'] && response['result']['$t'] == 'OK') ? true : false;
    }
});

/* Douban Recommendation API Service
 * @method      get             获取推荐
 * @method      getForUser      获取用户的所有推荐
 * @method      add             发表新推荐
 * @method      remove          删除推荐
 * @method      getComment      获取推荐回复
 * @method      addComment      发表新回复
 * @method      removeComment   删除回复
 */
var RecommendationService = $.klass(CommonService, {
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

    getComment: function(recommendation, offset, limit, callback) {
        return this._getForObject(recommendation, offset, limit, callback, CommentEntry, GET_RECOMMENDATION_URL, '/comments');
    },

    addComment: function(recommendation, data, callback) {
        var url = this.lazyUrl(recommendation, GET_RECOMMENDATION_URL) + '/comments';
        return this._add(data, callback, url, Comment);
    },

    removeComment: function(comment, callback) {
        return this._remove(comment, callback);
    }
});

/* Douban Tag API Service
 * @method      getForSubject      某个书籍、电影、音乐中标记最多的标签
 * @method      getForUser         用户对书籍、电影、音乐标记的所有标签
*/
var TagService = $.klass(BaseService, {
    getForSubject: function(subject, offset, limit, callback) {
        return this._getForObject(subject, offset, limit, callback, TagEntry, null, '/tags');
    },

    getForUser: function(user, offset, limit, callback, type) {
        return this._getForObject(user, offset, limit, callback, TagEntry, GET_PEOPLE_URL, '/tags', { 'cat': type });
    }
});

// }}}

// {{{ Douban object classes like ``User`` and ``Note``
/* Base class of douban object like user and note 
 * @param   feed JSON. Gdata JSON feed
 */
var DoubanObject = $.klass({
    init: function(data) {
        this._data = data;
        this.createFromJson();
    },

    /* Create object from given JSON feed. Please implement it in subclass.
     * @param   data JSON
     */
    createFromJson: function() {
        if (this._data) {
            for (var i = 0, len = this.all.length; i < len; i++) {
                var name = this.all[i];
                this[name] = this._getAttribute(name);
            }
        }
    },

    /* Get read-only json feed
     */
    getData: function() {
        return this._data;
    },

    /* Update the feed and object
     */
    updatedata: function(data) {
        this._data = data;
        this.createFromJson();
    },

    /* Get attributes from JSON feed and given them 
     * a human-readable name
     */
    _getAttribute: function(attr) {
        switch (attr) {
            case 'address':
                return this.getAddress();
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
            case 'count':
                return this._data['@count'] || this.getAttr('db:count');
            case 'endTime':
            case 'published':
            case 'startTime':
            case 'updated':
                return this.getTime(attr);
            case 'id':
                return this.getAttr('id') || this.getUrl('self');
            case 'intro':
                return this.getAttr('content');
            case 'imageUrl':
                return this.getUrl('image') || this.getUrl('icon');
            case 'isInviteOnly':
                return this.getBool('invite_only');
            case 'isInviteEnabled':
                return this.getBool('can_invite');
            case 'isReplyEnabled':
                return this.getBool('can_reply');
            case 'isPublic':
                return this.getBool('privacy', 'public');
            case 'limit':
                return parseInt(this.getAttr("opensearch:itemsPerPage") || "0");
            case 'location':
            case 'status':
                return this.getAttr('db:' + attr);
            case 'name':
                return this._data['@name'] || this.getAttr('title');
            case 'offset':
                return parseInt(this.getAttr("opensearch:startIndex") || "1") - 1;
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
            case 'total':
                return parseInt(this.getAttr("opensearch:totalResults") || "0");
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

    // Get the attribute
    getAttr: function (attr) {
        if (this._data[attr])
            return this._data[attr]['$t'];
        var attrs = this._data['db:attribute'];
        if (attrs)
            for (var i in attrs)
                if (attrs[i]['@name'] == attr) return attrs[i]['$t'];
    },

    // Get a list of attributes
    getAttrs: function(name) {
        var attrs = [], feedAttributes = this._data['db:attribute'];
        for (var i = 0, len = feedAttributes.length; i < len; i++)
            if (feedAttributes[i]['@name'] == name)
                attrs.push(feedAttributes[i]['$t']);
        return attrs;
    },

    // Get the url
    getUrl: function(attr) {
        // default ``attr`` is 'alternate'
        attr = attr || 'alternate';
        var links = this._data['link'];
        for (var i in links)
            if (links[i]['@rel'] == attr) return links[i]['@href'];
    },

    // Get the category for miniblog object
    getCategory: function() {
        if (this._data['category'][0]) var category = this._data['category'][0];
        else var category = this._data['category'];
        return category['@term'].match(/\.(\w+)$/)[1];
    },

    // Get chinese title for movie object
    getChineseTitle: function() {
        var attrs = this._data['db:attribute'];
        for (var i = 0, len = attrs.length; i < len; i++)
            if (attrs[i]['@name'] == 'aka' && attrs[i]['@lang'] == 'zh_CN')
                return attrs[i]['$t'];
    },

    // Get an attibute and convert it into boolean value
    getBool: function(attr, trueValue) {
        return this.getAttr(attr) == (trueValue || 'yes') ? true : false;
    },

    // Get address
    getAddress: function() {
        return this._data['gd:where']['@valueString'];
    },

    // Get author, returns a user object
    getAuthor: function() {
        return new User(this._data.author);
    },

    // Get subject, returns a book, movie or music object
    getSubject: function() {
        return DoubanObject.subjectFactory(this._data['db:subject']);
    },

    // Get time and turn it into javascript date object
    getTime: function(attr) {
        var time = typeof this._data['gd:when'] != 'undefined' ? this._data['gd:when']['@' + attr] : this.getAttr(attr);
        return time ? $.parseDate(time) : undefined;
    },

    // Get rating
    getRating: function() {
        var rating = this._data['gd:rating'];
        if (rating) return parseFloat(rating['@average'] || rating['@value']);
    },

    // Get votes
    getVotes: function() {
        var rating = this._data['gd:rating'];
        if (rating) return rating['@numRaters'];
    },

    // Get tags for subject or user, returns a list of tag object
    getTags: function() {
        var dbTags = this._data['db:tag'];
        var tags = [];
        if (dbTags)
            for (var i = 0, len = dbTags.length; i < len; i++)
                tags.push(new Tag(dbTags[i]));
        return tags;
    }
});
// Class method
/* Factory method of Douban books, movies and music
 * @returns     Book, Movie or Music object
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

/* Base class of douban object entry like ``UserEntry`` and ``NoteEntry``
 * @param   feed JSON. Gdata JSON feed
 * Following attributes are provided in all subclasses
 * @attribute       total           对象总数
 * @attribute       offset          一次返回的对象偏移量，对应'start-index - 1'
 * @attribute       limit           一次返回的对象数量，对应'max-results'
 * @attribute       entries         对象数组
 * @method          createFromJson
 */
var DoubanObjectEntry = $.klass(DoubanObject, {
    init: function($super, data) {
        this.all = ['title', 'total', 'offset', 'limit', 'entries'];
        $super(data);
    },

    createFromJson: function($super) {
        if (this._data) {
            $super();
            this.entries = [];
            for (var i = 0, len = this._data.entry.length; i < len; i++) {
                this.entries.push(new this.model(this._data.entry[i]));
            }
        }
    }
});

/* Base class for entries which has an author attribute
 * @attribute       author      作者
 */
var AuthorEntry = $.klass(DoubanObjectEntry, {
    createFromJson: function($super) {
        this.author = this.getAuthor();
        $super();
    }
});

/* Base class for search queries which has an query attribute
 * @attribute       query       搜索词
 */
var SearchEntry = $.klass(DoubanObjectEntry, {
    createFromJson: function($super) {
        this.query = this.getAttr('title').replace(/^搜索\ /, '').replace(/\ 的结果$/, '');
        $super();
    }
});

/* Douban user class
 * @param           data            Well-formatted json feed
 * @attribute       id              用户ID
 * @attribute       userName        用户名
 * @attribute       screenName      昵称
 * @attribute       location        常居地
 * @attribute       blog            网志主页
 * @attribute       intro           自我介绍
 * @attribute       url             豆瓣主页
 * @attribute       iamgeUrl        头像
 * @method          createFromJson  由豆瓣返回的JSON，初始化数据
 */
var User = $.klass(DoubanObject, {
    init: function($super, data) {
        this.all = ['id', 'userName', 'screenName', 'location', 'blog', 'intro', 'url', 'imageUrl'];
        $super(data);
    }
});

/* Douban user entries
 */
var UserEntry = $.klass(SearchEntry, {
    init: function($super, data) {
        this.model = User;
        $super(data);
    }
});

/* Douban note class
 * @param           data            Well-formatted json feed
 * @attribute       id              日记ID
 * @attribute       title           日记标题
 * @attribute       author          日记作者，User object
 * @attribute       summary         日记摘要，如果设为全文输出，则和content相同
 * @attribute       content         日记全文
 * @attribute       published       日记发布时间
 * @attribute       updated         日记最近更新时间
 * @attribute       url             日记URL
 * @attribute       isPublic        是否公开
 * @attribute       isReplyEnabled  是否允许回复
 * @method          createFromJson  由豆瓣返回的JSON，初始化数据
 */
var Note = $.klass(DoubanObject, {
    init: function($super, data) {
        this.all = ['id', 'title', 'author', 'summary', 'content', 'published', 'updated', 'url', 'isPublic', 'isReplyEnabled'];
        $super(data);
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
 */
var NoteEntry = $.klass(AuthorEntry, {
    init: function($super, data) {
        this.model = Note;
        $super(data);
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

/* Douban movie class
 * @param           data            Well-formatted json feed
 * @attribute       id              电影ID
 * @attribute       title           电影名
 * @attribute       chineseTitle    中文电影名
 * @attribute       aka             又名
 * @attribute       directors       导演
 * @attribute       writers         编剧
 * @attribute       cast            演员
 * @attribute       imdb            IMDB
 * @attribute       releaseDate     发布时间
 * @attribute       episode         集数
 * @attribute       language        语言
 * @attribute       country         国家
 * @attribute       summary         电影简介
 * @attribute       url             条目URL
 * @attribute       imageUrl        海报URL
 * @attribute       website         官方网站
 * @attribute       tags            被标记最多的TAG
 * @attribute       rating          平均得分
 * @attribute       votes           投票人数
 * @method          createFromJson  由豆瓣返回的JSON，初始化数据
 */
var Movie = $.klass(DoubanObject, {
    init: function($super, data) {
        this.all = ['id', 'title', 'chineseTitle', 'aka', 'directors', 'writers', 'cast', 'imdb', 'releaseDate', 'episode', 'language', 'country', 'summary', 'url', 'imageUrl', 'website', 'tags', 'rating', 'votes'];
        $super(data);
    }
});

/* Douban movie entry
 */
var MovieEntry = $.klass(SearchEntry, {
    init: function($super, data) {
        this.model = Movie;
        $super(data);
    }
});

/* Douban movie class
 * @param           data            Well-formatted json feed
 * @attribute       id              唱片ID
 * @attribute       title           唱片名
 * @attribute       aka             又名
 * @attribute       artists         表演者
 * @attribute       ean             EAN
 * @attribute       releaseDate     发布时间
 * @attribute       media           媒介
 * @attribute       discs           唱片书
 * @attribute       version         版本特性
 * @attribute       summary         唱片简介
 * @attribute       track           曲目
 * @attribute       url             条目URL
 * @attribute       imageUrl        封面URL
 * @attribute       tags            被标记最多的TAG
 * @attribute       rating          平均得分
 * @attribute       votes           投票人数
 * @method          createFromJson  由豆瓣返回的JSON，初始化数据
 */
var Music = $.klass(DoubanObject, {
    init: function($super, data) {
        this.all = ['id', 'title', 'aka', 'artists', 'ean', 'releaseDate', 'publisher', 'media', 'discs', 'version', 'summary', 'tracks', 'url', 'imageUrl', 'tags', 'rating', 'votes'];
        $super(data);
    }
});

/* Douban music entry
 */
var MusicEntry = $.klass(SearchEntry, {
    init: function($super, data) {
        this.model = Music;
        $super(data);
    }
});

/* Douban review entry
 * @param           data            Well-formatted json feed
 * @attribute       id              评论ID
 * @attribute       title           评论标题
 * @attribute       author          评论作者，User object
 * @attribute       summary         评论摘要
 * @attribute       content         评论全文
 * @attribute       published       评论发布时间
 * @attribute       updated         评论最近更新时间
 * @attribute       url             评论URL
 * @attribute       rating          评论对条目的评分
 * @method          createFromJson  由豆瓣返回的JSON，初始化数据
 */
var Review = $.klass(DoubanObject, {
    init: function($super, data) {
        this.all = ['id', 'title', 'author', 'subject', 'summary', 'content', 'published', 'updated', 'url', 'rating'];
        $super(data);
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

/* Douban review for user entry
 */
var ReviewForUserEntry = $.klass(AuthorEntry, {
    init: function($super, data) {
        this.model = Review;
        $super(data);
    }
});

/* Douban review for subject entry
 */
var ReviewForSubjectEntry = $.klass(DoubanObjectEntry, {
    init: function($super, data) {
        this.model = Review;
        $super(data);
    }
});

/* Douban collection class
 * @param           data            Well-formatted json feed
 * @attribute       id              收藏ID
 * @attribute       title           收藏标题
 * @attribute       author          收藏者，User object
 * @attribute       subject         收藏条目，Subject object
 * @attribute       content         收藏评论
 * @attribute       updated         收藏最近更新时间
 * @attribute       status          收藏状态，查表可去：http://tinyurl.com/59rqm2
 * @attribute       tags            收藏用TAG
 * @attribute       rating          收藏评分
 * @method          createFromJson  由豆瓣返回的JSON，初始化数据
 */
var Collection = $.klass(DoubanObject, {
    init: function($super, data) {
        this.all = ['id', 'title', 'owner', 'content', 'updated', 'subject', 'status', 'tags', 'rating'];
        $super(data);
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

/* Douban collection entry
 */
var CollectionEntry = $.klass(AuthorEntry, {
    init: function($super, data) {
        this.model = Collection;
        $super(data);
    }
});

/* Douban miniblog class
 * @param           data            Well-formatted json feed
 * @attribute       id              广播ID
 * @attribute       title           广播标题
 * @attribute       content         广播内容
 * @attribute       published       广播发布时间
 * @attribute       category        类别
 * @attribute       type            子类别
 * @attribute       imageUrl        相关图片链接
 * @method          createFromJson  由豆瓣返回的JSON，初始化数据
 */
var Miniblog = $.klass(DoubanObject, {
    init: function($super, data) {
        this.all = ['id', 'title', 'content', 'published', 'category', 'type', 'imageUrl'];
        $super(data);
    }
});
// Class methods
/* create POST or PUT xml
 * @param       data, Object
 * @data        content, String
 */
Miniblog.createXml = function(data) {
    data = $.extend({ content: '' }, data || {});
    var xml = '<?xml version="1.0" encoding="UTF-8"?><entry xmlns:ns0="http://www.w3.org/2005/Atom" xmlns:db="http://www.douban.com/xmlns/"><content>{CONTENT}</content></entry>';
    return xml.replace(/\{CONTENT\}/, data.content);
};

/* Douban miniblog entry
 */
var MiniblogEntry = $.klass(AuthorEntry, {
    init: function($super, data) {
        this.model = Collection;
        $super(data);
    }
});

/* Douban recommendation class
 * @param           data            Well-formatted json feed
 * @attribute       id              推荐ID
 * @attribute       title           推荐标题
 * @attribute       content         推荐全文
 * @attribute       published       推荐发布时间
 * @attribute       type            类别
 * @attribute       comment         评论
 * @method          createFromJson  由豆瓣返回的JSON，初始化数据
 */
var Recommendation = $.klass(DoubanObject, {
    init: function($super, data) {
        this.all = ['id', 'title', 'content', 'published', 'type', 'comment'];
        $super(data);
    }
});
// Class methods
/* create POST or PUT xml
 * @param       data, Object
 * @data        comment, String
 * @data        title, String
 * @data        url, String
 */
Recommendation.createXml = function(data) {
    data = $.extend({ comment: '', title: '', url: '' }, data || {});
    var xml = '<?xml version="1.0" encoding="UTF-8"?><entry xmlns="http://www.w3.org/2005/Atom" xmlns:gd="http://schemas.google.com/g/2005" xmlns:opensearch="http://a9.com/-/spec/opensearchrss/1.0/" xmlns:db="http://www.douban.com/xmlns/"><title>{TITLE}</title><db:attribute name="comment">{COMMENT}</db:attribute><link href="{URL}" rel="related" /></entry>';
    return xml.replace(/\{COMMENT\}/, data.comment)
              .replace(/\{URL\}/, data.url)
              .replace(/\{TITLE\}/, data.title);
};

/* Douban recommendation entry
 */
var RecommendationEntry = $.klass(AuthorEntry, {
    init: function($super, data) {
        this.model = Recommendation;
        $super(data);
    }
});

/* Douban recommendation comment class
 * @param           data            Well-formatted json feed
 * @attribute       id              回复ID
 * @attribute       author          回复者，User object
 * @attribute       content         回复全文
 * @attribute       published       回复发布时间
 * @method          createFromJson  由豆瓣返回的JSON，初始化数据
 */
var Comment = $.klass(DoubanObject, {
    init: function($super, data) {
        this.all = ['id', 'author', 'published', 'content'];
        $super(data);
    }
});
// Class methods
/* create POST or PUT xml
 * @param       data, Object
 * @data        content, String
 */
Comment.createXml = function(data) {
    data = $.extend({ content: '' }, data || {});
    var xml = '<entry><content>{CONTENT}</content></entry>';
    return xml.replace(/\{CONTENT\}/, data.content);
};

/* Douban recommendation comment entry
 */
var CommentEntry = $.klass(AuthorEntry, {
    init: function($super, data) {
        this.model = Comment;
        $super(data);
    }
});

/* Douban event class
 * @param           data            Well-formatted json feed
 * @attribute       id              活动ID
 * @attribute       title           活动标题
 * @attribute       owner           活动发起者，User object
 * @attribute       summary         活动摘要
 * @attribute       content         活动全文
 * @attribute       startTime       活动开始时间
 * @attribute       endTime         活动结束时间
 * @attribute       url             活动URL
 * @attribute       imageUrl        活动封面URL
 * @attribute       category        活动类别
 * @attribute       location        活动城市
 * @attribute       address         活动地点
 * @attribute       isInviteOnly    是否只允许受邀请者参加
 * @attribute       isInviteEnabled 是否能够邀请参加
 * @attribute       participants    活动参与者数量
 * @attribute       wishers         活动感兴趣者数量
 * @method          createFromJson  由豆瓣返回的JSON，初始化数据
 */
var Event = $.klass(DoubanObject, {
    init: function($super, data) {
        this.all = ['id', 'title', 'owner', 'category', 'location', 'startTime', 'endTime', 'summary', 'content', 'url', 'imageUrl', 'isInviteOnly', 'isInviteEnabled', 'participants', 'wishers', 'address' ];
        $super(data);
    }
});
// Class methods
/* create POST or PUT xml
 * @param       data, Object
 * @data        content, String
 */
Event.createXml = function(data) {
    data = $.extend({ category: 'music', title: '', content: '',
                      isInviteOnly: false, isInviteEnabled: true,
                      startTime: new Date(), endTime: new Date(),
                      address: ''
                    }, data || {});
    var isInviteOnly = data.isInviteOnly == true ? 'yes' : 'no';
    var isInviteEnabled = data.isInviteEnabled == true ? 'yes' : 'no';
    var startTime = $.parseDate(data.startTime);
    var endTime = $.parseDate(data.endTime);
    var xml = '<?xml version="1.0" encoding="UTF-8"?><entry xmlns="http://www.w3.org/2005/Atom" xmlns:db="http://www.douban.com/xmlns/" xmlns:gd="http://schemas.google.com/g/2005" xmlns:opensearch="http://a9.com/-/spec/opensearchrss/1.0/"><title>{TITLE}</title><category scheme="http://www.douban.com/2007#kind" term="http://www.douban.com/2007#event.{CATEGORY}"/><content>{CONTENT}</content><db:attribute name="invite_only">{IS_INVITE_ONLY}</db:attribute><db:attribute name="can_invite">{IS_INVITE_ENABLED}</db:attribute><gd:when endTime="{END_TIME}" startTime="{START_TIME}"/><gd:where valueString="{ADDRESS}"></gd:where></entry>';
    return xml.replace(/\{TITLE\}/, data.title)
              .replace(/\{CATEGORY\}/, data.category)
              .replace(/\{CONTENT\}/, data.content)
              .replace(/\{IS_INVITE_ONLY\}/, isInviteOnly)
              .replace(/\{IS_INVITE_ENABLED\}/, isInviteEnabled)
              .replace(/\{START_TIME\}/, startTime)
              .replace(/\{END_TIME\}/, endTime)
              .replace(/\{ADDRESS\}/, data.address);
};
Event.createRemoveXml = function(data) {
    data = $.extend({ reason: "对不起，活动因故取消了" }, data || {});
    var xml = '<?xml version="1.0" encoding="UTF-8"?><entry xmlns:ns0="http://www.w3.org/2005/Atom" xmlns:db="http://www.douban.com/xmlns/"><content>{REASON}</content></entry>';
    return xml.replace(/\{REASON\}/, data.reason);
};

/* Douban event entry
 */
var EventEntry = $.klass(DoubanObjectEntry, {
    init: function($super, data) {
        this.model = Event;
        $super(data);
    }
});

/* Douban search event entry
 */
var EventSearchEntry = $.klass(SearchEntry, {
    init: function($super, data) {
        this.model = Event;
        $super(data);
    }
});

/* Douban tag class
 * @param           data            Well-formatted json feed
 * @attribute       id              标签ID
 * @attribute       name            标签名
 * @attribute       count           标签被使用的次数
 * @method          createFromJson  由豆瓣返回的JSON，初始化数据
 */
var Tag = $.klass(DoubanObject, {
    init: function($super, data) {
        this.all = ['id', 'name', 'count'];
        $super(data);
    }
});

/* Douban tag entry
 */
var TagEntry = $.klass(DoubanObjectEntry, {
    init: function($super, data) {
        this.model = Tag;
        $super(data);
    }
});
// }}}

/* {{{ OAuth client
 * @usage
 * var apiToken = { key: 'blah', secret: 'blah' };
 * var client = $.douban('client', { key: 'blah', secret: 'blah' });
 * var requestToken = client.getRequestToken();
 * var url = client.getAuthorizationUrl(requestToken);
 * var accessToken = client.getAccessToken(requestToken);
 * var login = client.login(accessToken);
 */
function OAuthClient(options) {
    /* Default options */
    var defaults = {
        key: '',
        secret: '',
        type: 'jquery',
        async: false
    };
    this.options = $.extend(defaults, options || {});;
    this.api = new Token(this.options.key, this.options.secret);
    this._http = $.douban.http.factory({ type: this.options.type });

    this.requestToken = new Token();
    this.accessToken = new Token();
    this.authorizationUrl = '';
    this.userId = '';
}
$.extend(OAuthClient.prototype, {
    /* Get request token
     * @returns         Token object
     * @param           callback, Function
     */ 
    getRequestToken: function(callback) {
        var token = null;
        this.oauthRequest(REQUEST_TOKEN_URL, null, function(data) {
            data = $.unparam(data);
            token = { key: data.oauth_token,
                      secret: data.oauth_token_secret };
            if ($.isFunction(callback)) callback(token);
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
                               oauth_callback: encodeURIComponent(callbackUrl || '') });
        this.authorizationUrl = AUTHORIZATION_URL + '?' + params;
        return this.authorizationUrl
    },

    /* Get access token
     * @returns     token object
     * @param       requestToken Token. If not specified, using
     *              ``this.requestToken`` instead
     * @param       callback, Function
     */
    getAccessToken: function(requestToken, callback) {
        var self = this;
        if (requestToken) self.requestToken = requestToken;
        this.oauthRequest(ACCESS_TOKEN_URL,
                          { oauth_token: self.requestToken.key },
                          onSuccess);
        return self.accessToken;

        function onSuccess(data) {
            data = $.unparam(data);
            console.debug(data);
            self.accessToken = { key: data.oauth_token,
                                 secret: data.oauth_token_secret };
            self.userId = data.douban_user_id;
            if ($.isFunction(callback)) callback(self.accessToken, self.userId);
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
        this._http({ async: this.options.async, url: url, data: data, success: callback });
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
    'recommendation': Recommendation,
    'event': Event,
    'tag': Tag
};

/* Factory method of jQuery Douban
 * @returns     Douban objects
 * @param       factory, String
 * @param       options, Object
 * @usage
 * var service = $.douban({ key: 'blahblah', secret: 'blahblah' });
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
 * $.douban.http.register('gears', GearsHttpRequestHandler });
 * // Still use 'jquery' HTTP Request API as handler
 * $.douban.http.setActive('jquery');
 * // Get some url
 * var json = $.douban.http({ url: url, params: params });
 * // Unregister request handler
 * $.douban.http.unregister('air');
 *
 */
$.douban.http = function(options) {
    return $.douban.http.activeHandler(options);
};

/* Create HTTP request handler by the default 'jquery' handler 
 * In addition, you can register other handlers either
 * by passing arguments ``type`` and ``handler`` to the factory
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

/* Default handler is jquery
 */
$.douban.http.activeHandler = jqueryHandler;

/* A dict of HTTP request name and its constructor,
 */
$.douban.http.handlers = {
    jquery: jqueryHandler,
    greasemonkey: greasemonkeyHandler
};

/* Set active handler
 */
$.douban.http.setActive = function(name) {
    $.douban.http.activeHandler = $.douban.http.handlers[name];
};

/* Default http settings
 */
$.douban.http.settings = {
    async: false,
    url: location.href,
    type: 'GET',
    data: null,
    headers: {},
    contentType: 'application/atom+xml',
    dataType: 'text',
    error: null,
    success: null
};

/* Register new HTTP request handler to ``handlers``
 */
$.douban.http.register = function(name, handler) {
    if ($.isFunction(handler)) {
        $.douban.http.handlers[name] = handler;
    }
};

/* Unregister an existed HTTP request handler
 */
$.douban.http.unregister = function(name) {
    $.douban.http.handlers[name] = undefined;
};

/* Built-in HTTP request handlers: 'jquery'
 */
function jqueryHandler(s) {
    s = $.extend({}, $.douban.http.settings, s || {});
    $.extend(s, {
        async: false,
        headers: undefined,
        processData: s.type.match(/^P(OS|U)T$/) ? false : true,
        beforeSend: function(xhr) {
            for (var name in s.headers)
                xhr.setRequestHeader(name, s.headers[name]);
        }
    });
    return $.ajax(s);
}
jqueryHandler.name = 'jquery';

function greasemonkeyHandler(s) {
    if (!GM_xmlhttpRequest) return;
    s = $.extend({}, $.douban.http.settings, s || {});
    if (s.data && typeof s.data != "string") s.data = $.param(s.data);
    if (s.data && s.type == "GET") {
        s.url += (s.url.match(/\?/) ? "&" : "?") + s.data;
        s.data = null;
    }
    $.extend(s.headers, { 'Content-Type': s.contentType });
    return GM_xmlhttpRequest({
        method: s.type,
        url: s.url,
        data: s.data,
        headers: s.headers,
        onload: onLoad
        // 'onerror': s.error
    });
    function onLoad(response) {
        var data = response.responseText;
        if (s.dataType == 'json') data = eval("(" + data + ")");
        return s.success(data);
    }
}
greasemonkeyHandler.name = 'greasemonkey';
// }}}

})(jQuery);
