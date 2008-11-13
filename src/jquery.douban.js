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
 * @param       factory String
 * @param       options Dict
 * @usage
 * var service = $.douban({ apiKey: 'blahblah', apiSecret: 'blahblah' });
 * service.login(accessKey, accessSecret);
 * if (service.isAuthenticated()) {
 *     var id = service.miniblog.add("发送一条广播");
 * }
 */
$.douban = function(factory, options) {
    // if ``factory`` argument was ommited, default is 'service'
    if (!!factory && typeof factory == 'object') {
        options = factory;
        factory = 'service';
    }
    return new $.douban[factory].factory(options);
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
    _handler: function() { return; },

    /* Create HTTP request handler by the given type
     * including 'jquery', 'greasemonkey' and 'gears'
     * In addition, you can register other handlers either
     * by passing arguments ``httpType`` and ``httpHandler`` to the factory
     * method
     * TODO
     * @usage ...
     */
    factory: function(options) {
    },

};

})(jQuery);
