function jqueryHandler(s) {
    s = $.extend({}, douban.http.settings, s || {});
    $.extend(s, {
        async: false,
        headers: undefined,
        processData: s.type.match(/^P(OS|U)T$/) && s.data ? false : true,
        beforeSend: function(xhr) {
            for (var name in s.headers)
                xhr.setRequestHeader(name, s.headers[name]);
        }
    });
    return $.ajax(s);
}
jqueryHandler.name = 'jquery';
