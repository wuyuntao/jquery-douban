module("Gears Http Request");

test("test gears basic http method", function() {
    // Register gears handler
    $.douban.http.register('gears', gearsHandler);

    // Build gears handler
    var handler = $.douban.http.factory({ type: 'gears' });

    stop();
    handler({
        type: 'GET',
        url: 'http://api.douban.com/book/subject/2023013?alt=json',
        success: function(json) {
            ok(json, "get response ok: " + json);
            start();
        }
    });
});
