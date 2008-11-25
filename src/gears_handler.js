/* 
 * Gears request handler for jQuery Douban
 *
 * Copyright (c) 2008 Wu Yuntao <http://blog.luliban.com/>
 * Licensed under the Apache 2.0 license.
 *
 */
var gearsHandler = function(s) {
    s = $.extend($.douban.http.settings, s || {});

    // Set proxy for url
    s.url = gearsHandler.proxy + s.url;

    // JavaScript function cannot be marshaled in child worker
    var success = s.success;
    s.success = undefined

    // Setup the WorkerPool
    var workerPool = google.gears.factory.create('beta.workerpool');

    // Handle on success
    workerPool.onmessage = function(a, b, message) {
        success(message.body);
    };

    // Create child worker
    var childWorkerId = workerPool.createWorkerFromUrl(gearsHandler.workerUrl);

    workerPool.sendMessage(s, childWorkerId);
};

gearsHandler.name = 'gears';

gearsHandler.proxy = 'http://jquery-douban.appspot.com/proxy?url=';

gearsHandler.workerUrl = 'http://localhost/jdouban/src/gears_worker.js';
// gearsHandler.workerUrl = 'http://jquery-douban.appspot.com/worker.js';
