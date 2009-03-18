var PEOPLE_URL = API_HOST + '/people',
    GET_PEOPLE_URL = PEOPLE_URL  + '/{ID}',
    GET_CURRENT_URL = PEOPLE_URL  + '/%40me';     // %40 => @

var User = Douban.user = Douban.service.user = function(feed) {
    if (feed.api) this.service = feed;      // As service
    else return Parser.isEntry(feed) ?      // As parser
        new Parser(feed).entries(User) :
        new Parser(feed).attr('id').attr('uri', 'id')
                        .attr('db:uid')
                        .attr('title', 'name').attr('name')
                        .attr('db:location')
                        .attr('content', 'intro')
                        .links({ 'alternate': 'home',
                                 'icon': 'image',
                                 'homepage': 'blog' });
};

// Douban User API Service
// @method      get             获取用户信息
// @method      search          搜索用户
// @method      current         获取当前授权用户信息
// @method      friends         获取用户朋友
// @method      contacts        获取用户关注的人
User.prototype = {
    get: function(user, callback) {
        return this.service.get(user, callback, User, GET_PEOPLE_URL);
    },

    search: function(query, offset, limit, callback) {
        return this.service.search(query, offset, limit, callback,
                                   User, PEOPLE_URL);
    },

    current: function(callback) {
        return this.service.get(GET_CURRENT_URL, callback, User);
    },

    friends: function(user, offset, limit, callback) {
        return this.service.entry(user, offset, limit, callback,
                                  User, GET_PEOPLE_URL + '/friends');
    },

    contacts: function(user, offset, limit, callback) {
        return this.service.entry(user, offset, limit, callback,
                                  User, GET_PEOPLE_URL + '/contacts');
    }
};
