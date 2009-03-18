if (gadgets) {

var Douban = {};
Douban.handler = {};
Douban.util = {
    buildUri: function(url, params) {
        return url + (/\?/.test(url) ? '&' : '?') + $.param(params);
    }
};

var GadgetHandler = Douban.handler.gadget = {
    name: 'gadget',
    
    GET: function(url, params, headers, success) {
        url = Douban.util.buildUri(url, params); 
        var parameters = GadgetHandler.setParams('GET', 'JSON', headers);
        return gadgets.io.makeRequest(url, success, parameters );
    },

    POST: function(url, params, data, headers, success) {
        url = Douban.util.buildUri(url, params); 
        var parameters  = GadgetHandler.setParams('POST', 'JSON', headers, data);
        return gadgets.io.makeRequest(url, success, parameters );
    },

    PUT: function(url, params, data, headers, success) {
        url = Douban.util.buildUri(url, params); 
        var parameters = GadgetHandler.setParams('PUT', 'JSON', headers, data);
        return gadgets.io.makeRequest(url, success, parameters);
    },

    DELETE: function(url, params, headers, success) {
        url = Douban.util.buildUri(url, params); 
        var parameters = GadgetHandler.setParams('DELETL', 'TEXT', headers);
        return gadgets.io.makeRequest(url, success, parameters);
    },

    setParams: function(type, contentType, headers, data) {
        var params = {};
        params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType[type];
        params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType[contentType];
        params[gadgets.io.RequestParameters.HEADERS] = headers;
        if (data) params[gadgets.io.RequestParameters.POST_DATA] = data;
        return params;
    }
}
