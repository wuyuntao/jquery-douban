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

})(jQuery);
