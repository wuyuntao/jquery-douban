if (window.google && google.gears) {

var GearsHandler = Douban.handler.gears = {
    name: 'gears',
    proxy: null,

    GET: function(url, params, headers, success, type) {
        var url = Douban.util.buildUri(url, params, GearsHandler.proxy)
        var req = google.gears.factory.create('beta.httprequest');
        GearsHandler.setStateChange(req, type || 'json', success);
        req.open('GET', url);
        GearsHandler.setHeaders(req, headers);
        req.send();
    },

    POST: function(url, params, data, headers, success, type) {
        var url = Douban.util.buildUri(url, params, GearsHandler.proxy)
        var req = google.gears.factory.create('beta.httprequest');
        GearsHandler.setStateChange(req, type || 'json', success);
        req.open('POST', url);
        headers['Content-Type'] = 'application/atom+xml';
        GearsHandler.setHeaders(req, headers);
        req.send(data);
    },

    PUT: function(url, params, data, headers, success, type) {
        var url = Douban.util.buildUri(url, params, GearsHandler.proxy)
        var req = google.gears.factory.create('beta.httprequest');
        headers['Content-Type'] = 'application/atom+xml';
        GearsHandler.setStateChange(req, type || 'json', success);
        req.open('PUT', url);
        GearsHandler.setHeaders(req, headers);
        req.send(data);
    },

    DELETE: function(url, params, headers, success, type) {
        var url = Douban.util.buildUri(url, params, GearsHandler.proxy)
        var req = google.gears.factory.create('beta.httprequest');
        GearsHandler.setStateChange(req, type || 'text', success);
        req.open('DELETE', url);
        GearsHandler.setHeaders(req, headers);
        req.send();
    },

    setStateChange: function(request, type, success) {
        request.onreadystatechange = function() {
            if (request.readyState == 4 &&
                request.status >= 200 && request.status < 304) {
                var data = request.responseText;
                if (type == 'json') data = eval('(' + data + ')');
                success && success(data);
            }
        }
    },

    setHeaders: function(req, headers) {
        for (var name in headers)
            req.setRequestHeader(name, headers[name]);
    }
};

}
