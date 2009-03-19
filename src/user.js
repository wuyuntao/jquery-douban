var GET_CURRENT_URL = PEOPLE_URL  + '/%40me';     // %40 => @

// Douban User API Service
var User = Douban.service.user = function(service) {
    this.service = service;
};
User.prototype = {
    // 获取用户信息
    get: function(user, callback) {
        this.service.get(user, callback, Douban.user, GET_PEOPLE_URL);
    },
    // 搜索用户
    search: function(query, offset, limit, callback) {
        this.service.search(query, offset, limit, callback, Douban.user, PEOPLE_URL);
    },
    // 获取当前授权用户信息
    current: function(callback) {
        this.service.get(GET_CURRENT_URL, callback, Douban.user);
    },
    // 获取用户朋友
    friends: function(user, offset, limit, callback) {
        this.service.entry(user, offset, limit, callback, Douban.user, GET_PEOPLE_URL + '/friends');
    },
    // 获取用户关注的人
    contacts: function(user, offset, limit, callback) {
        this.service.entry(user, offset, limit, callback, Douban.user, GET_PEOPLE_URL + '/contacts');
    }
};
