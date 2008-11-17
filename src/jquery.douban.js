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
const SEARCH_PEOPLE_URL = PEOPLE_URL + '/';         // bug? 没有'/'的话，不能使用
const GET_PEOPLE_URL = PEOPLE_URL  + '/{USERNAME}';
const GET_CURRENT_URL = PEOPLE_URL  + '/%40me';     // hack: %40 => @
const GET_FRIENDS_URL = GET_PEOPLE_URL + '/friends';
const GET_CONTACTS_URL = GET_PEOPLE_URL + '/contacts';
// }}}

/* {{{ Factory method of jQuery Douban
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
// }}}

/* {{{ Factory method of Douban Service
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
// }}}

/* {{{ Factory method of OAuth Client
 * @returns     OAuth client object
 * @param       options Dict
 * @usage
 * var client = $.douban.client.factory({ apiKey: 'blah', apiSecret: 'blah' });
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
// }}}

/* {{{ Factory method of Douban User
 */
$.douban.user = {
    factory: function(data) {
        return new DoubanUser(data);
    }
};
// }}}

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

/* {{{ Some utilities
 */
$.extend({
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

/* Douban services

/* Douban service
 * @returns     null
 * @param       options Dict
 * @option      apiKey String
 * @option      apiSecret String
 * @option      httpType String
 * @option      httpHandler String
 */
function DoubanService(options) {
    /* Default options */
    var defaults = {
        apiKey: '',
        apiSecret: '',
        httpType: 'jquery',
    };
    this.options = $.extend(defaults, options || {});;
    this.api = new Token(this.options.apiKey, this.options.apiSecret);
    this.http = $.douban.http.factory({ type: this.options.httpType });
    this.client = $.douban.client.factory({ apiKey: this.api.key,
                                            apiSecret: this.api.secret,
                                            type: this.options.httpType });
    this.user = new DoubanUserService(this);
}
$.extend(DoubanService.prototype, {
    /* {{{ Adapter methods of client
     */
    login: function(accessToken) {
        return this.client.login(accessToken);
    },
    // }}}

    get: function(url, params, callback) {
        var json = null;
        var params = this.setParams(params);
        var setHeaders = this.setHeaders(url, 'GET', params);
        this.http({ async: false,
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

    post: function(url, data) {
        throw new Error("Not Implemented Yet");
    },

    put: function(url, data) {
        throw new Error("Not Implemented Yet");
    },

    delete: function(url) {
        throw new Error("Not Implemented Yet");
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
        var headers = this.client.getAuthHeaders(url, type, params);
        return function(xhr) {
            xhr.setRequestHeader('Authorization', headers);
            xhr.setRequestHeader('WWW-Authenticate', 'OAuth realm=""');
        }
    }
});

/* Douban User Service
 * @method      get             获取用户信息
 * @method      search          获取当前授权用户信息
 * @method      current         搜索用户
 * @method      friend          获取用户朋友
 * @method      contact         获取用户关注的人
 */
function DoubanUserService(service) {
    this.service = service;
}
$.extend(DoubanUserService.prototype, {
    get: function(name) {
        var url = GET_PEOPLE_URL.replace(/\{USERNAME\}/, name);
        var json = this.service.get(url);
        return json ? new DoubanUser(json) : false;
    },

    search: function(query, offset, limit) {
        var url = SEARCH_PEOPLE_URL;
        var params = { 'q': query, 'start-index': offset || 0, 'max-results': limit || 50 };
        var json = this.service.get(url, params);
        return json ? new DoubanUserEntries(json) : false;
    },

    current: function() {
        var url = GET_CURRENT_URL;
        var json = this.service.get(url);
        return json ? new DoubanUser(json) : false;
    },

    friends: function(user, offset, limit) {
        var url = GET_FRIENDS_URL.replace(/\{USERNAME\}/, user);
        var params = { 'start-index': offset || 0, 'max-results': limit || 50 };
        var json = this.service.get(url, params);
        return json ? new DoubanUserEntries(json) : false;
    },

    contacts: function(user, offset, limit) {
        var url = GET_CONTACTS_URL.replace(/\{USERNAME\}/, user);
        var params = { 'start-index': offset || 0, 'max-results': limit || 50 };
        var json = this.service.get(url, params);
        return json ? new DoubanUserEntries(json) : false;
    }
});

/* Douban user
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
function DoubanUser(data) {
    this.createFromJson(data);
}
$.extend(DoubanUser.prototype, {
    createFromJson: function(json) {
        this.id = getId(json);
        this.userName = getAttr(json, 'db:uid')
        this.screenName = getAttr(json, 'title');
        this.location = getAttr(json, 'db:location');
        this.intro = getAttr(json, 'content');
        this.url = getUrl(json);
        this.iconUrl = getIconUrl(json);
        this.blog = getUrl(json, 'homepage');
    },
});

/* Douban user entries
 * @param       data                Well-formatted json feed
 * @attribute   offset
 * @attribute   limit
 * @attribute   entries
 * @method      createFromJson
 */
function DoubanUserEntries(data) {
    this.createFromJson(data);
}
$.extend(DoubanUserEntries.prototype, {
    createFromJson: function(json) {
        this.query = getTitle(json).replace(/^搜索\ /, '').replace(/\ 的结果$/, '');
        this.total = getTotal(json);
        this.offset = getOffset(json);
        this.limit = getLimit(json);
        this.entries = []
        for (var i = 0, len = json.entry.length; i < len; i++) {
            this.entries.push(new DoubanUser(json.entry[i]));
        }
    },
});

/* OAuth client
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
    this.http = $.douban.http.factory({ type: this.options.httpType });

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
                               oauth_callback: callbackUrl });
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
        this.http({ async: false, url: url, data: data, success: callback });
    }
});

/* A simple token object */
function Token(key, secret) {
    this.key = key || '';
    this.secret = secret || '';
}

/* {{{ Douban GData JSON feed parsers
 */
// Get attributes from json
function getAttr(json, attr) {
    return typeof json[attr] == 'undefined' ? '' : json[attr]['$t'];
}

// Get id from json
function getId(json) {
    return getAttr(json, 'id');
}

// Get title
function getTitle(json) {
    return getAttr(json, 'title');
}

// Get total
function getTotal(json) {
    return parseInt(getAttr(json, "opensearch:totalResults"));
}

// Get offset
function getOffset(json) {
    return parseInt(getAttr(json, "opensearch:startIndex"));
}

// Get limit
function getLimit(json) {
    return parseInt(getAttr(json, "opensearch:itemsPerPage"));
}

// Get url from json links
function getUrl(json, attr) {
    attr = attr || 'alternate';
    for (i in json['link']) {
        var link = json['link'][i];
        if (link['@rel'] == attr) {
            return link['@href'];
        }
    }
    return '';
}

// Get icon url from json links
function getIconUrl(json) {
    return getUrl(json, 'icon');
}
// }}}

})(jQuery);
