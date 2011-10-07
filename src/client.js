var AUTH_HOST = 'http://www.douban.com',
    REQUEST_TOKEN_URL = AUTH_HOST + '/service/auth/request_token',
    AUTHORIZATION_URL = AUTH_HOST + '/service/auth/authorize',
    ACCESS_TOKEN_URL = AUTH_HOST + '/service/auth/access_token';

var Client = function(options) {
    this.api = { key: options.key || '', secret: options.secret || '' };
    this.request = options.handler || Douban.handler.jquery;
    // Access token
    this.token = { key: '', secret: '' };
};

Client.prototype = {
    requestToken: function(callback) {
        var headers = this.header(REQUEST_TOKEN_URL, 'GET',
                                  {}, { key: '', secret: '' });
        this.request.GET(REQUEST_TOKEN_URL, null, headers, response, 'text');

        function response(data) {
            data = Douban.util.unparam(data);
            var token = { key: data.oauth_token,
                          secret: data.oauth_token_secret };
            callback && callback(token);
        }
    },

    authorizationUrl: function(requestToken, callbackUrl) {
        requestToken = requestToken || this.requestToken;
        var params = $.param({
            oauth_token: requestToken.key,
            oauth_callback: encodeURIComponent(callbackUrl || '')
        });
        return AUTHORIZATION_URL + '?' + params;
    },

    accessToken: function(token, callback) {
        var headers = this.header(ACCESS_TOKEN_URL, 'GET',
                                  { oauth_token: token.key }, token);
        this.request.GET(ACCESS_TOKEN_URL, null, headers, response, 'text');

        function response(data) {
            data = Douban.util.unparam(data);
            var token = { key: data.oauth_token,
                          secret: data.oauth_token_secret };
            uid = data.douban_user_id;
            callback && callback(token, uid);
        }
    },

    login: function(token) {
        // check length of access token
        if (token.key.length == 32 && token.secret.length == 16) {
            this.token = token;
            return true;
        } else {
            return false;
        }
    },

    // Get an OAuth header. Look into oauth.js for details
    header: function(url, method, params, token) {
        token = token || this.token;
        var accessor = {
            consumerSecret: this.api.secret,
            tokenSecret: token.secret
        };
        params = $.extend({
            oauth_consumer_key: this.api.key,
            oauth_token: token.key,
            oauth_signature_method: 'HMAC-SHA1',
            oauth_version: '1.0'
        }, params || {});
        var message = {
            action: url,
            method: method,
            parameters: params
        };
        OAuth.setTimestampAndNonce(message);
        OAuth.SignatureMethod.sign(message, accessor);
        var map = OAuth.getParameterMap(message.parameters);
        var header = 'OAuth realm=""';
        for (var key in map) header += ', ' + key + '="' + map[key] + '"';
        return { 'Authorization': header };
    }
};
