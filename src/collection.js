var COLLECTION_URL = API_HOST + '/collection',
    GET_COLLECTION_URL = COLLECTION_URL + '/{ID}';

// Douban Collection API Service
var Collection = Douban.service.collection = function(service) {
    this.service = service;
};
Collection.prototype = {
    // 获取收藏信息
    get: function(collection, callback) {
        this.service.get(collection, callback, Douban.collection, GET_COLLECTION_URL);
    },
    // 获取用户收藏信息
    getForUser: function(user, offset, limit, callback, extras) {
        this.service.entry(user, offset, limit, callback, Douban.collection, GET_PEOPLE_URL + '/collection');
    },
    // 添加收藏
    add: function(data, callback) {
        this.service.add(data, callback, COLLECTION_URL , Douban.collection);
    },
    // 更新收藏信息
    update: function(collection, data, callback) {
        this.service.update(collection, data, callback, GET_COLLECTION_URL, Douban.collection);
    },
    // 删除收藏
    remove: function(collection, callback) {
        this.service.remove(collection, callback, GET_COLLECTION_URL);
    }
};

Douban.collection.createXML = function(data) {
    var xml = '<?xml version="1.0" encoding="UTF-8"?><entry xmlns:ns0="http://www.w3.org/2005/Atom" xmlns:db="http://www.douban.com/xmlns/"><db:subject><id>{ID}</id></db:subject><db:status>{STATUS}</db:status>{TAGS}<content>{CONTENT}</content><gd:rating xmlns:gd="http://schemas.google.com/g/2005" value="{RATING}" ></gd:rating><db:attribute name="privacy">{PRIVATE}</db:attribute></entry>',
        id = typeof data.subject == 'object' ? data.subject.id : data.subject,
        tags = data.tags ? data.tags : [];
    for (var i = 0, len = tags.length; i < len; ++i)
        tags[i] = '<db:tag name="' + tags[i] + '"></db:tag>';
    return xml.replace(/\{ID\}/, id || '')
              .replace(/\{STATUS\}/, data.status || '')
              .replace(/\{CONTENT\}/, data.content || '')
              .replace(/\{RATING\}/, data.rating || 3)
              .replace(/\{TAGS\}/, tags.join(''))
              .replace(/\{PRIVATE\}/, data.isPrivate ? 'private' : 'public');
};
