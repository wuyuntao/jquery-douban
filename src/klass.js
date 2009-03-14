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
        this.api = { key: this.options.key, secret: this.options.secret };

        this._http = douban.http.factory({ type: this.options.type });
        this._client = douban('client', this.options);
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
        else if (/^\w+$/.test('' + obj) && tmpl) return tmpl.replace(/\{ID\}/, obj);
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
        var url = this.lazyUrl(object, templateUrl) + (suffix || '');
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
