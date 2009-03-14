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
var douban = function(factory, options) {
    if (typeof factory != 'string') {
        options = factory;
        factory = 'service';
    }
    if (factory == 'http')
        return douban.http.factory(options);
    return new factoryDict[factory](options);
};
/* Create XML by given factory
 * @returns     XML String
 * @param       factory, String
 * @param       data, Object
 */
douban.createXml = function(factory, data) {
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
douban.http = function(options) {
    return douban.http.activeHandler(options);
};

/* Create HTTP request handler by the default 'jquery' handler 
 * In addition, you can register other handlers either
 * by passing arguments ``type`` and ``handler`` to the factory
 * method
 */
douban.http.factory = function(options) {
    /* Default options */
    var defaults = {
        type: 'jquery',
        handler: null
    },
    options = $.extend(defaults, options || {});
    if (typeof douban.http.handlers[options.type] == 'undefined') {
        // Register and set active the new handler
        if ($.isFunction(options.handler)) {
            douban.http.register(options.type, options.handler);
        } else {
            throw new Error("Invalid HTTP request handler");
        }
    }
    return douban.http.handlers[options.type];
};

/* Default handler is jquery
 */
douban.http.activeHandler = jqueryHandler;

/* A dict of HTTP request name and its constructor,
 */
douban.http.handlers = {
    jquery: jqueryHandler,
    greasemonkey: greasemonkeyHandler
};

/* Set active handler
 */
douban.http.setActive = function(name) {
    douban.http.activeHandler = douban.http.handlers[name];
};

/* Default http settings
 */
douban.http.settings = {
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
douban.http.register = function(name, handler) {
    if ($.isFunction(handler)) {
        douban.http.handlers[name] = handler;
    }
};

/* Unregister an existed HTTP request handler
 */
douban.http.unregister = function(name) {
    douban.http.handlers[name] = undefined;
};

// Expose
$.douban = douban;
