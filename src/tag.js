// Douban Tag API Service
var Tag = Douban.service.tag = function(service) {
    this.service = service;
};
Tag.prototype = {
    // 某个书籍、电影、音乐中标记最多的标签
    getForSubject: function(subject, offset, limit, callback) {
        this.service.entry(subject + '/tags', offset, limit, callback, Douban.tag);
    },
    // 用户对书籍、电影、音乐标记的所有标签
    getForUser: function(user, offset, limit, callback, type) {
        return this._getForObject(user, offset, limit, callback, Douban.tag, GET_PEOPLE_URL + '/tags', { 'cat': type });
    }
});
