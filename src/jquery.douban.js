(function($) {
/* 
 * jQuery Douban
 *
 * Copyright (c) 2008 Wu Yuntao <http://blog.luliban.com/>
 * Licensed under the Apache 2.0 license.
 *
 */

/* Factory method of Douban Service
 * @returns     Douban service object
 * @param       options Dict
 * @usage
 * var service = $.douban({ apiKey: 'blahblah', apiSecret: 'blahblah' });
 * service.login(accessKey, accessSecret);
 * if (service.isAuthenticated()) {
 *     var id = service.miniblog.add("发送一条广播");
 * }
 */
$.douban = function(options) {
    return new $.douban.service.factory(options);
};

$.douban.service = {
    factory: DoubanService
};

/* Douban service class
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
        httpHandler: null
    }
    this.options = $.extend(defaults, options || {});;
    this.apiKey = this.options.apiKey;
    this.apiSecret = this.options.apiSecret;
}

$.douban.http = {
    /* GET method
     * @returns     JSON
     * @param       url String
     * @param       params String or Dict
     */
    get: function(url, params) {
        throw new Error("Not Implemented Yet");
    },

    /* POST method
     * @returns     JSON
     * @param       url String
     * @param       data String
     */
    post: function(url, data) {
        throw new Error("Not Implemented Yet");
    },

    /* PUT method
     * @returns     JSON
     * @param       url String
     * @param       data String
     */
    put: function(url, data) {
        throw new Error("Not Implemented Yet");
    },

    /* POST method
     * @returns     JSON
     * @param       url String
     */
    delete: function(url) {
        throw new Error("Not Implemented Yet");
    },

    /* Handler should be initialized by ``factory`` */
    handler: function() { return; },

    /* A dict of HTTP request name and its constructor,
     */
    handlerDict: {
        // 'jquery': jQueryHttpRequestHandler,
        // 'greasemonkey': GreaseMonkeyHttpRequestHandler,
        // 'gears': GearsHttpRequestHandler
    },

    /* Register new HTTP request handler to ``handlerDict``
     */
    register: function(name, constructor) {
        if ($.isFunction(constructor)) {
            this.handlerDict[name] = constructor;
        }
    },

    /* Unregister an existed HTTP request handler
     */
    unregister: function(name) {
        this.handlerDict[name] = undefined;
    },

    /* Default options */
    options: {
        type: 'jquery',
        handler: null
    },

    /* Create HTTP request handler by the given type
     * including 'jquery', 'greasemonkey' and 'gears'
     * In addition, you can register other handlers either
     * by passing arguments ``httpType`` and ``httpHandler`` to the factory
     * method
     * TODO
     * @usage ...
     */
    factory: function(options) {
        var options = $.extend(this.options, options || {});
        if (this.handlerDict[options.type]) {
            var constructor = this.handlerDict[options.type];
            return new constructor();
        } 
    }

};

})(jQuery);
