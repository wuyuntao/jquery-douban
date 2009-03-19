var MINIBLOG_URL = API_HOST + '/miniblog',
    GET_MINIBLOG_URL = MINIBLOG_URL + '/{ID}';

// Douban Miniblog API Service
var Miniblog = Douban.service.miniblog = function(service) {
    this.service = service;
};
Miniblog.prototype = {
    // 获取广播
    getForUser: function(miniblog, callback) {
        this.service.entry(miniblog, callback, Douban.miniblog, GET_MINIBLOG_URL);
    },
    // 获取用户广播
    getForUser: function(user, offset, limit, callback) {
        this.service.entry(user, offset, limit, callback, Douban.miniblog, GET_PEOPLE_URL + '/miniblog');
    },
    // 获取用户友邻广播
    getForContacts: function(user, offset, limit, callback) {
        this.service.entry(user, offset, limit, callback, Douban.miniblog, GET_PEOPLE_URL + '/miniblog/contacts');
    },
    // 添加广播
    add: function(data, callback) {
        this.service.add(data, callback, MINIBLOG_URL + '/saying', Douban.miniblog);
    },
    // 删除广播
    remove: function(miniblog, callback) {
        this.service.remove(miniblog, callback, GET_MINIBLOG_URL);
    }
};

Douban.miniblog.createXML = function(data) {
    var xml = '<?xml version="1.0" encoding="UTF-8"?><entry xmlns:ns0="http://www.w3.org/2005/Atom" xmlns:db="http://www.douban.com/xmlns/"><content>{CONTENT}</content></entry>';
    return xml.replace(/\{CONTENT\}/, data.content || '');
};
