function createService() {
    gearsHandler.proxyUrl = null;
    gearsHandler.workerUrl = '../src/gears_worker.js';
    $.douban.http.register('gears', gearsHandler);
    var service = $.douban('service', {
        key: '0107c5c3c9d4ecc40317514b5d7ec64c',
        secret: '7feaf4ec7b6989f8',
        type: 'gears'
    });
    service.login({ key: '242968ea69f7cbc46c7c3abf3de7634c',
                    secret: '9858f453d21ab6e0' });
    return service;
}

module("Gears Http Request");

/*
test("test gears basic http method", function() {
    // Register gears handler
    $.douban.http.register('gears', gearsHandler);

    // Build gears handler
    var handler = $.douban.http.factory({ type: 'gears' });

    stop();
    handler({
        type: 'GET',
        dataType: 'json',
        url: 'http://api.douban.com/book/subject/2023013?alt=json',
        success: function(json) {
            ok(typeof json == 'object', "get response ok: " + json);
            start();
        }
    });
});
*/

test("test get current user", function() {
    var service = createService();
    stop();
    service.user.current(function(me) {
        equals(me.id, "http://api.douban.com/people/2133418", "get current user name ok");
        equals(me.userName, "iloveshutuo", "get current user id ok");
        start();
    });
});

test("test get review", function() {
    var service = createService();
    stop();
    service.review.get('1523679', function(review) {
        equals(review.title, '第二季第二话');
        equals(review.author.screenName, '真月居深红魅玉大圣天');
        equals(review.rating, 5);
        start();
    });
});

test("test get review for user", function() {
    var service = createService();
    stop();
    service.review.getForUser('1563045', 3, 3, function(reviews) {
        equals(reviews.total, 20);
        equals(reviews.offset, 3);
        equals(reviews.limit, 3);
        equals(reviews.entries.length, 3);
        start();
    });
});

test("test get review for subject", function() {
    var service = createService();
    stop();
    service.review.getForSubject('http://api.douban.com/movie/subject/3199462', null, null, function(reviews) {
        equals(reviews.total, 6);
        equals(reviews.offset, 0);
        equals(reviews.limit, 50);
        equals(reviews.entries.length, 6);
        start();
    });
});

test("test add review", function() {
    var service = createService();
    var Review = null;
    stop();
    service.review.add({ subject: 'http://api.douban.com/music/subject/3288632', title: "测试", content: "评论的内容不会太短了吧，可恶的测试啊。果然就是太短了，可恶的测试啊。评论的内容不会太短了吧，可恶的测试啊。果然就是太短了，可恶的测试啊。评论的内容不会太短了吧，可恶的测试啊。果然就是太短了，可恶的测试啊。评论的内容不会太短了吧，可恶的测试啊。果然就是太短了，可恶的测试啊。", rating: 5 }, function(review) {
        ok(review.id.match(/http:\/\/api\.douban\.com\/review\/\d+/), "get id ok: " + review.id);
        equals(review.title, "测试");
        equals(review.content, "评论的内容不会太短了吧，可恶的测试啊。果然就是太短了，可恶的测试啊。评论的内容不会太短了吧，可恶的测试啊。果然就是太短了，可恶的测试啊。评论的内容不会太短了吧，可恶的测试啊。果然就是太短了，可恶的测试啊。评论的内容不会太短了吧，可恶的测试啊。果然就是太短了，可恶的测试啊。");
        equals(review.author.screenName, 'ilovest');
        equals(review.rating, 5);
        Review = review;
        start();
    });
});

/*
test("test update review", function() {
    var service = createService();
    stop();
    service.review.update('1563285', { title: "测试更新", content: "更新后评论的内容不会太短了吧，可恶的测试啊。更新后评论的内容不会太短了吧，可恶的测试啊。更新后评论的内容不会太短了吧，可恶的测试啊。更新后评论的内容不会太短了吧，可恶的测试啊。更新后评论的内容不会太短了吧，可恶的测试啊。", rating: 4 }, function(review) {
        equals(review.title, "测试更新");
        equals(review.content, "更新后评论的内容不会太短了吧，可恶的测试啊。更新后评论的内容不会太短了吧，可恶的测试啊。更新后评论的内容不会太短了吧，可恶的测试啊。更新后评论的内容不会太短了吧，可恶的测试啊。更新后评论的内容不会太短了吧，可恶的测试啊。");
        equals(review.author.screenName, 'ilovest');
        equals(review.rating, 4);
        start();
    });
});
*/

test("test remove review", function() {
    var service = createService();
    // Get reviews and remove them
    service.review.getForUser('iloveshutuo', null, null, function(reviews) {
        for (var i = 0, len = reviews.total; i < len; i++) {
            service.review.remove(reviews.entries[i]);
        }
        stop();
        // Test if they are all deleted
        service.review.getForUser('iloveshutuo', null, null, function(reviews) {
            equals(reviews.total, 0);
            start();
        });
    });
});

// vim: foldmethod=indent
