if (window.jQuery) {

var jQueryHandler = Douban.handler.jquery = {
    name: 'jquery',

    GET: function(url, params, headers, success, type) {
        return jQuery.ajax({ url: Douban.util.buildUri(url, params),
                             type: 'GET',
                             dataType: type || 'json',
                             success: success,
                             beforeSend: this.beforeSend(headers) });
    },

    POST: function(url, params, data, headers, success, type) {
        return jQuery.ajax({ url: Douban.util.buildUri(url, params),
                             type: 'POST',
                             data: data,
                             dataType: type || 'json',
                             processData: false,
                             contentType: 'application/atom+xml',
                             success: success,
                             beforeSend: this.beforeSend(headers) });
    },

    PUT: function(url, params, data, headers, success, type) {
        return jQuery.ajax({ url: Douban.util.buildUri(url, params),
                             type: 'PUT',
                             data: data,
                             dataType: type || 'json',
                             processData: false,
                             contentType: 'application/atom+xml',
                             success: success,
                             beforeSend: this.beforeSend(headers) });
    },

    DELETE: function(url, params, headers, success, type) {
        return jQuery.ajax({ url: Douban.util.buildUri(url, params),
                             type: 'DELETE',
                             dataType: type || 'text',
                             success: success,
                             beforeSend: this.beforeSend(headers) });
    },

    beforeSend: function(headers) {
        return function(xhr) {
            for (var name in headers)
                xhr.setRequestHeader(name, headers[name]);
        }
    }
};

}
