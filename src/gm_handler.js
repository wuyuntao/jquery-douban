function greasemonkeyHandler(s) {
    if (!GM_xmlhttpRequest) return;
    s = $.extend({}, douban.http.settings, s || {});
    if (s.data && typeof s.data != "string") s.data = $.param(s.data);
    if (s.data && s.type == "GET") {
        s.url += (s.url.match(/\?/) ? "&" : "?") + s.data;
        s.data = null;
    }
    $.extend(s.headers, { 'Content-Type': s.contentType });
    return GM_xmlhttpRequest({
        method: s.type,
        url: s.url,
        data: s.data,
        headers: s.headers,
        onload: onLoad
        // 'onerror': s.error
    });
    function onLoad(response) {
        var data = response.responseText;
        if (s.dataType == 'json') data = eval("(" + data + ")");
        return s.success(data);
    }
}
greasemonkeyHandler.name = 'greasemonkey';
