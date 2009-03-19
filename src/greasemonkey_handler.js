if (GM_xmlhttpRequest) {

var GreasemonkeyHandler = Douban.handler.greasemonkey = {
    name: 'greasemonkey',

    GET: function(url, params, headers, success, type) {
        return GM_xmlhttpRequest({ url: Douban.util.buildUri(url, params),
                                   method: 'GET',
                                   headers: headers,
                                   onload: this.onload(type || 'json', success) });
    },

    POST: function(url, params, data, headers, success, type) {
        headers['Content-Type'] = 'application/atom+xml';
        return GM_xmlhttpRequest({ url: Douban.util.buildUri(url, params),
                                   method: 'POST',
                                   data: data,
                                   headers: headers,
                                   onload: this.onload(type || 'json', success) });
    },

    PUT: function(url, params, data, headers, success, type) {
        headers['Content-Type'] = 'application/atom+xml';
        return GM_xmlhttpRequest({ url: Douban.util.buildUri(url, params),
                                   method: 'PUT',
                                   data: data,
                                   headers: headers,
                                   onload: this.onload(type || 'json', success) });
    },

    DELETE: function(url, params, headers, success, type) {
        return GM_xmlhttpRequest({ url: Douban.util.buildUri(url, params),
                                   method: 'DELETE',
                                   headers: headers,
                                   onload: this.onload(type || 'text', success) });
    },

    onload: function(type, success) {
        return function(response) {
            var data = response.responseText;
            if (type == 'json') data = eval("(" + data + ")");
            success && success(data);
        }
    }
};

}
