// Setup the WorkerPool
var wp = google.gears.workerPool;

// Allow a cross-origin script to run this
wp.allowCrossOrigin();

wp.onmessage = function(a, b, message) {
    var s = message.body;

    // Setup the request
    var request = google.gears.factory.create('beta.httprequest');

    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            wp.sendMessage(request.responseText, message.sender);
        }
    };

    // Open URL
    request.open(s.type, s.url);

    // Set request headers
    for (var name in s.headers)
        request.setRequestHeader(name, s.headers[name]);

    // Send request
    if (s.data) request.send(s.data);
    else request.send();
};
