// Setup the WorkerPool
var wp = google.gears.workerPool;
// Allow a cross-origin script to run this
wp.allowCrossOrigin();
wp.onmessage = function(a, b, message) {
    // Setup the request
    var options = message.body;
    var request = google.gears.factory.create('beta.httprequest');

    request.open(options.type, options.url);
    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            // Send the response to parent worker
            wp.sendMessage(response, message.sender);
        }
    };
    request.send();
};
