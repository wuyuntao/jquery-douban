if (jQuery) {

var Douban = {};
Douban.handler = {};
Douban.util = {
    buildUri: function(url, params) {
        return url + (/\?/.test(url) ? '&' : '?') + $.param(params);
    }
};

var jQueryHandler = Douban.handler.jquery = {
    name: 'jquery',

    GET: function(url, params, headers, success, type) {
        return jQuery.ajax({ url: url,
                             type: 'GET',
                             data: params,
                             dataType: type || 'json',
                             success: success,
                             beforeSend: jQueryHandler.beforeSend(headers) });
    },

    POST: function(url, params, data, headers, success, type) {
        return jQuery.ajax({ url: Douban.util.buildUri(url, params),
                             type: 'POST',
                             data: data,
                             dataType: type || 'json',
                             processData: false,
                             contentType: 'application/atom+xml',
                             success: success,
                             beforeSend: jQueryHandler.beforeSend(headers) });
    },

    PUT: function(url, params, data, headers, success, type) {
        return jQuery.ajax({ url: Douban.util.buildUri(url, params),
                             type: 'PUT',
                             data: data,
                             dataType: type || 'json',
                             processData: false,
                             contentType: 'application/atom+xml',
                             success: success,
                             beforeSend: jQueryHandler.beforeSend(headers) });
    },

    DELETE: function(url, params, headers, success, type) {
        return jQuery.ajax({ url: url,
                             type: 'DELETE',
                             data: params,
                             dataType: type || 'text',
                             success: success,
                             beforeSend: jQueryHandler.beforeSend(headers) });
    },

    beforeSend: function(headers) {
        return function(xhr) {
            for (var name in headers)
                xhr.setRequestHeader(name, headers[name]);
        }
    }
};

}
