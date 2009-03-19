var RECOMM_URL = API_HOST + '/recommendation',
    GET_RECOMM_URL = RECOMM_URL + '/{ID}';

// Douban Recommendation API Service
var Recommendation = Douban.service.recommendation = function(service) {
    this.service = service;
};
Recommendation.prototype = {
    // 获取推荐
    get: function(recomm, callback) {
        this.service.get(recomm, callback, Douban.recommendation, GET_RECOMM_URL);
    },
    // 获取用户的所有推荐
    getForUser: function(user, offset, limit, callback, extras) {
        this.service.entry(user, offset, limit, callback, Douban.recommendation, GET_PEOPLE_URL + '/recommendations');
    },
    // 发表新推荐
    add: function(data, callback) {
        this.service.add(data, callback, RECOMM_URL + 's' , Douban.recommendation);
    },
    // 删除推荐
    remove: function(recomm, callback) {
        this.service.remove(recomm, callback, GET_RECOMM_URL);
    },
    // 获取推荐回复
    getComments: function(recomm, offset, limit, callback) {
        this.service.entry(recomm, offset, limit, callback, Douban.comment, GET_RECOMM_URL + '/comments');
    },
    // 发表新回复
    addComment: function(recomm, data, callback) {
        var url = this.service.lazyURL(recomm, GET_RECOMM_URL + '/comments');
        this.service.add(data, callback, url, Douban.comment);
    },
    // 删除回复
    removeComment: function(comment, callback) {
        this.service.remove(comment, callback);
    }
};

Douban.recommendation.createXML = function(data) {
    var xml = '<?xml version="1.0" encoding="UTF-8"?><entry xmlns="http://www.w3.org/2005/Atom" xmlns:gd="http://schemas.google.com/g/2005" xmlns:opensearch="http://a9.com/-/spec/opensearchrss/1.0/" xmlns:db="http://www.douban.com/xmlns/"><title>{TITLE}</title><db:attribute name="comment">{COMMENT}</db:attribute><link href="{URL}" rel="related" /></entry>';
    return xml.replace(/\{COMMENT\}/, data.comment || '')
              .replace(/\{URL\}/, data.url || '')
              .replace(/\{TITLE\}/, data.title || '');
};

Douban.comment.createXML = function(data) {
    var xml = '<entry><content>{CONTENT}</content></entry>';
    return xml.replace(/\{CONTENT\}/, data.content || '');
};
