/* Douban User API Service
 * @method      get             获取用户信息
 * @method      search          搜索用户
 * @method      current         获取当前授权用户信息
 * @method      friends         获取用户朋友
 * @method      contacts        获取用户关注的人
 */
var UserService = $.klass(BaseService, {
    get: function(user, callback) {
        return this._get(user, callback, User, GET_PEOPLE_URL);
    },

    search: function(query, offset, limit, callback) {
        return this._search(query, offset, limit, callback, PEOPLE_URL, UserEntry);
    },

    current: function(callback) {
        return this._get(GET_CURRENT_URL, callback, User);
    },

    friends: function(user, offset, limit, callback) {
        return this._getForObject(user, offset, limit, callback, UserEntry, GET_PEOPLE_URL, '/friends');
    },

    contacts: function(user, offset, limit, callback) {
        return this._getForObject(user, offset, limit, callback, UserEntry, GET_PEOPLE_URL, '/contacts');
    }
});

/* Douban user class
 * @param           data            Well-formatted json feed
 * @attribute       id              用户ID
 * @attribute       userName        用户名
 * @attribute       screenName      昵称
 * @attribute       location        常居地
 * @attribute       blog            网志主页
 * @attribute       intro           自我介绍
 * @attribute       url             豆瓣主页
 * @attribute       iamgeUrl        头像
 * @method          createFromJson  由豆瓣返回的JSON，初始化数据
 */
var User = $.klass(DoubanObject, {
    init: function($super, data) {
        this.all = ['id', 'userName', 'screenName', 'location', 'blog', 'intro', 'url', 'imageUrl'];
        $super(data);
    }
});

/* Douban user entries
 */
var UserEntry = $.klass(SearchEntry, {
    init: function($super, data) {
        this.model = User;
        $super(data);
    }
});
