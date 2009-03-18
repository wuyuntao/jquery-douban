var AUTH_HOST = 'http://www.douban.com',
    REQUEST_TOKEN_URL = AUTH_HOST + '/service/auth/request_token',
    AUTHORIZATION_URL = AUTH_HOST + '/service/auth/authorize',
    ACCESS_TOKEN_URL = AUTH_HOST + '/service/auth/access_token';

var Client = function(options) {
    this.api = { key: this.options.key || '', secret: this.options.secret || '' };
    this.request = options.handler || Douban.handler.jquery;

    this.requestToken = { key: '', secret: '' };
    this.accessToken = { key: '', secret: '' };
    this.uid = '';
};

Client.prototype = {
    getRequestToken: function(callback) {
        var token = null;
        this.request.GET(REQUEST_TOKEN_URL, null, response, 'text');

        function response(data) {
            data = $.unparam(data);
            this.requestToken = { key: data.oauth_token,
                                  secret: data.oauth_token_secret };
            callback && callback(this.requestToken);
        }
    },

    getAuthorizationUrl: function(requestToken, callbackUrl) {
        var params = $.param({
            oauth_token: requestToken.key,
            oauth_callback: encodeURIComponent(callbackUrl || '')
        });
        return AUTHORIZATION_URL + '?' + params;
    },

    getAccessToken: function(requestToken, callback) {
        this.request.GET(ACCESS_TOKEN_URL,
                         { oauth_token: requestToken.key },
                         response);

        function response(data) {
            data = $.unparam(data);
            this.accessToken = { key: data.oauth_token,
                                 secret: data.oauth_token_secret };
            this.uid = data.douban_user_id;
            callback && callback(this.accessToken, this.uid);
        }
    },

    login: function(accessToken) {
        // check length of access token
        if (accessToken.key.length == 32 && accessToken.secret.length == 16) {
            this.accessToken = accessToken;
            return true;
        } else {
            return false;
        }
    },

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
        var accessor = { consumerSecret: this.api.secret,
                         tokenSecret: this.accessToken.secret };
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

    getParameters: function(url, method, parameters) {
        var message = this.getMessage(url, method, parameters);
        return OAuth.getParameterMap(message.parameters);
    }
};
