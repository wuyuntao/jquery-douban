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

/* Three built-in HTTP request handlers, 'jquery', 'greasemonkey' and 'gears'
 */
var jqueryHandler = {
    name: 'jquery',
    request: function(options) {
        throw new Error("Not Implemented Yet");
    }
};

var greasemonkeyHandler = {
    name: 'greasemonkey',
    request: function(options) {
        throw new Error("Not Implemented Yet");
    }
};

var gearsHandler = {
    name: 'gears',
    request: function(options) {
        throw new Error("Not Implemented Yet");
    }
};

/* HTTP module for douban
 * @usage
 * // Use Gears HTTP Request API as handler
 * var request = $.douban.http.factory({ type: 'gears' });
 * var json = request.get({ url: url, params: params });
 *
 * // Register new request handler
 * $.douban.http.register('air', AirHttpRequestHandler });
 * var request = $.douban.http.factory({ type: 'air' });
 * var json = request.post({ url: url, data: data });
 *
 * // Unregister request handler
 * $.douban.unregister('air');
 *
 */
$.douban.http = {
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
     */
    factory: function(options) {
        var options = $.extend(this.options, options || {});
        if (typeof this.handlers[options.type] == 'undefined') {
            if ($.isFunction(options.handler)) {
                this.register(options.type, options.handler);
            } else {
                throw new Error("Invalid HTTP request handler");
            }
        }
        var handler = this.handlers[options.type];
        return $.extend(this.baseHandler, handler);
    },

    /* A dict of HTTP request name and its constructor,
     */
    handlers: {
        jquery: jqueryHandler,
        greasemonkey: greasemonkeyHandler,
        gears: gearsHandler
    },

    /* Register new HTTP request handler to ``handlers``
     */
    register: function(name, constructor) {
        if ($.isFunction(constructor)) {
            this.handlers[name] = constructor;
        }
    },

    /* Unregister an existed HTTP request handler
     */
    unregister: function(name) {
        this.handlers[name] = undefined;
    },

    /* Prototype of HTTP request handler which other handlers should be 
     * extended from
     */
    baseHandler: {
        /* Name of the handler */
        name: null,

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

        /* Request method which methods above are adapted
         * @returns     JSON
         * @param       options Dict
         */
        request: function(options) {
            throw new Error("Not Implemented Yet");
        }
    }
};

})(jQuery);
