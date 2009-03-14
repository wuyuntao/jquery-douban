/* OAuth client
 * @usage
 * var apiToken = { key: 'blah', secret: 'blah' };
 * var client = $.douban('client', { key: 'blah', secret: 'blah' });
 * var requestToken = client.getRequestToken();
 * var url = client.getAuthorizationUrl(requestToken);
 * var accessToken = client.getAccessToken(requestToken);
 * var login = client.login(accessToken);
 */
var OAuthClient = $.klass({
    init: function(options) {
        /* Default options */
        var defaults = {
            key: '',
            secret: '',
            type: 'jquery',
            async: false
        };
        this.options = $.extend(defaults, options || {});;
        this.api = { key: this.options.key, secret: this.options.secret };
        this._http = douban.http.factory({ type: this.options.type });

        this.requestToken = { key: '', secret: '' };
        this.accessToken = { key: '', secret: '' };
        this.authorizationUrl = '';
        this.userId = '';
    },

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
