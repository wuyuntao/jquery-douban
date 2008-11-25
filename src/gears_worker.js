// Setup the WorkerPool
var wp = google.gears.workerPool;

// Allow a cross-origin script to run this
wp.allowCrossOrigin();

wp.onmessage = function(a, b, message) {
    var s = message.body;

    // Setup the request
    var request = google.gears.factory.create('beta.httprequest');

    // Open URL
    request.open(s.type, s.url);

    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            wp.sendMessage(request.responseText, message.sender);
        }
    };

    // Send request
    request.send();

};
