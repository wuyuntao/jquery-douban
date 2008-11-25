// Setup the WorkerPool
var wp = google.gears.workerPool;
// Allow a cross-origin script to run this
wp.allowCrossOrigin();
wp.onmessage = function(a, b, message) {
    // Setup the request
    var options = message.body;
    wp.sendMessage(options.url, message.sender);
};
