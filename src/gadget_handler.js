if (gadgets) {

var GadgetHandler = Douban.handler.gadget = {
    name: 'gadget',
    
    GET: function(url, params, headers, success, type) {
        url = Douban.util.buildUri(url, params); 
        var parameters = GadgetHandler.setParams('GET', type || 'JSON', headers);
        return gadgets.io.makeRequest(url, this.response(type, success), parameters );
    },

    POST: function(url, params, data, headers, success, type) {
        url = Douban.util.buildUri(url, params); 
        var parameters  = GadgetHandler.setParams('POST', type || 'JSON', headers, data);
        return gadgets.io.makeRequest(url, this.response(type, success), parameters );
    },

    PUT: function(url, params, data, headers, success, type) {
        url = Douban.util.buildUri(url, params); 
        var parameters = GadgetHandler.setParams('PUT', type || 'JSON', headers, data);
        return gadgets.io.makeRequest(url, this.response(type, success), parameters);
    },

    DELETE: function(url, params, headers, success, type) {
        url = Douban.util.buildUri(url, params); 
        var parameters = GadgetHandler.setParams('DELETE', type || 'TEXT', headers);
        return gadgets.io.makeRequest(url, this.response(type, success), parameters);
    },

    setParams: function(type, contentType, headers, data) {
        var params = {};
        params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType[type];
        params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType[contentType.toUpperCase()];
        params[gadgets.io.RequestParameters.HEADERS] = headers;
        if (data) params[gadgets.io.RequestParameters.POST_DATA] = data;
        return params;
    },

    response: function(type, success) {
        return function(response) {
            var data = type == 'text' ? response.text : response.data;
            success && success(data);
        }
    }
};

}
