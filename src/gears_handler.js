/* 
 * Gears request handler for jQuery Douban
 *
 * Copyright (c) 2008 Wu Yuntao <http://blog.luliban.com/>
 * Licensed under the Apache 2.0 license.
 *
 */
var gearsHandler = function(s) {
    if (!google || !google.gears) return;
    s = $.extend({}, $.douban.http.settings, s || {});

    // Convert data if not already a string
    if (s.data && typeof s.data != "string") s.data = $.param(s.data);

    // If data is available, append data to url for get requests
    if (s.data && s.type == "GET" || s.type == "DELETE") {
        s.url += (s.url.match(/\?/) ? "&" : "?") + s.data;
        s.data = null;
    }

    // Set proxy for url
    s.url = gearsHandler.proxy + encodeURIComponent(s.url);

    // Set Content-Type header
    if (s.data)
        $.extend(s.headers, { 'Content-Type': s.contentType });

    // JavaScript function cannot be marshaled in child worker
    var success = s.success;
    s.success = null;

    // Setup the WorkerPool
    var workerPool = google.gears.factory.create('beta.workerpool');

    // Handle on success
    workerPool.onmessage = function(a, b, message) {
        var data = message.body;
        if (s.dataType == 'json') data = eval("(" + data + ")");
        success(data);
    };

    // Create child worker and sent message to her
    var childWorkerId = workerPool.createWorkerFromUrl(gearsHandler.workerUrl);
    workerPool.sendMessage(s, childWorkerId);
};

gearsHandler.name = 'gears';

gearsHandler.proxy = 'http://jquery-douban.appspot.com/proxy?url=';
// gearsHandler.proxy = 'http://localhost:8080/proxy?url=';

gearsHandler.workerUrl = 'http://jquery-douban.appspot.com/worker.js';
// gearsHandler.workerUrl = 'http://localhost:8080/worker.js';
