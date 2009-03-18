var API_HOST = 'http://api.douban.com';

var Douban = function(options) {
    return new Service(options);
};

// Expose
window.Douban = Douban;

// HTTP Request handlers and API services
Douban.handler = {};
Douban.service = {};

// Base service class
var Service = function(options) {
    this.api = { key: options.key || '', secret: options.secret || '' };
    this.request = options.handler || Douban.handler.jquery;
    this.client = new Client(options);
    for (var name in Douban.service)
        this[name] = new Douban.service[name](this);
};
Service.prototype = {
    login: function(token) {
        return this.client.login(token);
    },

    params: function(params) {
        return $.extend({ 'apikey': this.api.key, 'alt': 'json' }, params || {});
    },

    lazyURL: function(obj, url) {
        if (typeof obj == 'object') return obj.id;
        else if (url && /^\w+$/.test(obj)) return url.replace(/\{ID\}/, obj);
        else return obj;
    },

    get: function(obj, callback, parser, url) {
        url = this.lazyURL(obj, url);
        var params = this.params();
        var headers = this.client.header(url, 'GET', params);
        this.request.GET(url, params, headers, this.response(callback, parser));
    },

    entry: function(obj, offset, limit, callback, parser, url, extras) {
        url = this.lazyURL(obj, url);
        extras = $.extend(extras || {}, {
            'start-index': (offset || 0) + 1,
            'max-results': limit || 50
        });
        var params = this.params(extras);
        var headers = this.client.header(url, 'GET', params);
        this.request.GET(url, params, headers, this.response(callback, parser));
    },

    search: function(query, offset, limit, callback, parser, url, extras) {
        extras = $.extend(extras || {}, { 'q': query });
        return this.entry(url, offset, limit, callback, parser, null, extras);
    },

    add: function(data, callback, url, parser) {
        data = typeof data == 'object' ? parser.createXML(data) : data;
        var params = this.params();
        var headers = this.client.header(url, 'POST', params);
        this.request.POST(url, params, data, headers, this.response(callback, parser));
    },

    update: function(obj, data, callback, url, parser) {
        url = this.lazyURL(obj, url);
        data = typeof data == 'object' ? parser.createXML(data) : data;
        var params = this.params();
        var headers = this.client.header(url, 'PUT', params);
        this.request.PUT(url, params, data, headers, this.response(callback, parser));
    },

    remove: function(obj, callback, url) {
        url = this.lazyURL(obj, url);
        var params = this.params();
        var headers = this.client.header(url, 'DELETE', params);
        this.request.DELETE(url, params, headers, this.response(callback, parser));
    },

    response: function(callback, parser) {
        return function(data) {
            if (typeof data == 'string') data = data == 'OK' ? true : false;
            else if (typeof data == 'object' && data['result'])
                data = data['result']['$t'] == 'OK' ? true : false;
            else data = data ? parser(data) : undefined;
            callback && callback(data);
        }
    }
}
