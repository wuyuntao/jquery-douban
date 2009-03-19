var REVIEW_URL = API_HOST + '/review',
    GET_REVIEW_URL = REVIEW_URL + '/{ID}';

// Douban Review API Service
var Review = Douban.service.review = function(service) {
    this.service = service;
};
Review.prototype = {
    // 获取评论信息
    get: function(review, callback) {
        this.service.get(review, callback, Douban.review, GET_REVIEW_URL);
    },
    // 特定用户的所有评论
    getForUser: function(user, offset, limit, callback, extras) {
        this.service.entry(user, offset, limit, callback, Douban.review, GET_PEOPLE_URL + '/reviews', extras);
    },
    // 特定书籍、电影、音乐的所有评论
    getForSubject: function(subject, offset, limit, callback, extras) {
        this.service.entry(subject + '/reviews', offset, limit, callback, Douban.review, extras);
    },
    // 发布新评论
    add: function(data, callback) {
        this.service.add(data, callback, REVIEW_URL + 's' , Douban.review);
    },
    // 更新评论
    update: function(review, data, callback) {
        this.service.update(review, data, callback, GET_REVIEW_URL, Douban.review);
    },
    // 删除评论
    remove: function(review, callback) {
        this.service.remove(review, callback, GET_REVIEW_URL);
    }
};

Douban.review.createXML = function(data) {
    var xml = '<?xml version="1.0" encoding="UTF-8"?><entry xmlns:ns0="http://www.w3.org/2005/Atom"><db:subject xmlns:db="http://www.douban.com/xmlns/"><id>{ID}</id></db:subject><content>{CONTENT}</content><gd:rating xmlns:gd="http://schemas.google.com/g/2005" value="{RATING}" ></gd:rating><title>{TITLE}</title></entry>';
    var id = typeof data.subject == 'object' ? data.subject.id : data.subject;
    return xml.replace(/\{ID\}/, id || '')
              .replace(/\{TITLE\}/, data.title || '')
              .replace(/\{CONTENT\}/, data.content || '')
              .replace(/\{RATING\}/, data.rating || 3);
};
