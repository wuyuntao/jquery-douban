/* Douban Tag API Service
 * @method      getForSubject      某个书籍、电影、音乐中标记最多的标签
 * @method      getForUser         用户对书籍、电影、音乐标记的所有标签
*/
var TagService = $.klass(BaseService, {
    getForSubject: function(subject, offset, limit, callback) {
        return this._getForObject(subject, offset, limit, callback, TagEntry, null, '/tags');
    },

    getForUser: function(user, offset, limit, callback, type) {
        return this._getForObject(user, offset, limit, callback, TagEntry, GET_PEOPLE_URL, '/tags', { 'cat': type });
    }
});

/* Douban tag class
 * @param           data            Well-formatted json feed
 * @attribute       id              标签ID
 * @attribute       name            标签名
 * @attribute       count           标签被使用的次数
 * @method          createFromJson  由豆瓣返回的JSON，初始化数据
 */
var Tag = $.klass(DoubanObject, {
    init: function($super, data) {
        this.all = ['id', 'name', 'count'];
        $super(data);
    }
});

/* Douban tag entry
 */
var TagEntry = $.klass(DoubanObjectEntry, {
    init: function($super, data) {
        this.model = Tag;
        $super(data);
    }
});
