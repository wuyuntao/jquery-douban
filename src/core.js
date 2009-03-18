var API_HOST = 'http://api.douban.com',

var Douban = function(options) {
    return new Service(options);
};

var Service = function(options) {
    this.api = { key: this.options.key || '', secret: this.options.secret || '' };
    this.request = options.handler || Douban.handler.jquery;
    this.client = new Client(options);
};

Service.prototype = {
    params: function(params) {
        return $.extend({ 'apikey': this.api.key, 'alt': 'json' }, params || {});
    }
}

// Expose
window.Douban = Douban;
