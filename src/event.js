/* Douban Event API Service
 * @method      get                     获取活动
 * @method      participants            获取参加活动的用户
 * @method      wishers                 获取活动感兴趣的用户
 * @method      getForUser              获取用户的所有活动
 * @method      getInitiateForUser      获取用户发起的活动
 * @method      getParticipateForUser   获取用户参加的活动
 * @method      getWishForUser          获取用户感兴趣的活动
 * @method      getForCity              获取城市的所有活动
 * @method      search                  搜索活动
 * @method      add                     创建新活动
 * @method      update                  更新活动
 * @method      remove                  删除活动
 * @method      participate             参加活动（未支持）
 * @method      notParticipate          不参加活动了（未支持）
 * @method      wish                    对活动感兴趣（未支持）
 * @method      unwish                  对活动不感兴趣（未支持）
 */
var EventService = $.klass(CommonService, {
    init: function($super, service) {
        this._model = Event;
        this._modelEntry = EventEntry;
        this._getObjectUrl = GET_EVENT_URL;
        this._addObjectUrl = ADD_EVENT_URL;
        this._suffix = '/events';
        $super(service);
    },

    participants: function(event, offset, limit, callback) {
        return this._getForObject(event, offset, limit, callback, UserEntry, GET_EVENT_URL, '/participants');
    },

    wishers: function(event, offset, limit, callback) {
        return this._getForObject(event, offset, limit, callback, UserEntry, GET_EVENT_URL, '/wishers');
    },

    getForUser: function(user, offset, limit, callback, type) {
        switch (type) {
            case 'initiate':
            case 'participate':
            case 'wish':
                var suffix = this._suffix + '/' + type; break;
            default:
                var suffix = this._suffix; break;
        }
        return this._getForObject(user, offset, limit, callback, this._modelEntry, GET_PEOPLE_URL, suffix);
    },

    getInitiateForUser: function(user, offset, limit, callback) {
        return this.getForUser(user, offset, limit, callback, 'initiate');
    },

    getParticipateForUser: function(user, offset, limit, callback) {
        return this.getForUser(user, offset, limit, callback, 'participate');
    },

    getWishForUser: function(user, offset, limit, callback) {
        return this.getForUser(user, offset, limit, callback, 'wish');
    },

    getForCity: function(city, offset, limit, callback) {
        return this._getForObject(city, offset, limit, callback, this._modelEntry, GET_EVENT_FOR_CITY_URL);
    },

    search: function(query, location, offset, limit, callback) {
        var params = {
            'q': query,
            'location': location || 'all',
            'start-index': (offset || 0) + 1,
            'max-results': limit || 50
        };
        var json = this._service.GET(this._addObjectUrl, params, this._onSuccess(callback, this._modelEntry));
        return this._response(json, this._modelEntry);
    },

    remove: function(event, data, callback) {
        if (!data || typeof data == 'object') data = this._model.createRemoveXml(data);
        var url = this.lazyUrl(event, this._getObjectUrl) + '/delete';
        var response = this._service.POST(url, data, this._onSuccess(callback));
        return (response['result'] && response['result']['$t'] == 'OK') ? true : false;
    },

    participate: function(event, callback) {
        throw new Error("Not Implemented");
    },

    notParticipate: function(event, callback) {
        throw new Error("Not Implemented");
    },

    wish: function(event, callback) {
        throw new Error("Not Implemented");
    },

    unwish: function(event, callback) {
        throw new Error("Not Implemented");
    }
});

/* Douban event class
 * @param           data            Well-formatted json feed
 * @attribute       id              活动ID
 * @attribute       title           活动标题
 * @attribute       owner           活动发起者，User object
 * @attribute       summary         活动摘要
 * @attribute       content         活动全文
 * @attribute       startTime       活动开始时间
 * @attribute       endTime         活动结束时间
 * @attribute       url             活动URL
 * @attribute       imageUrl        活动封面URL
 * @attribute       category        活动类别
 * @attribute       location        活动城市
 * @attribute       address         活动地点
 * @attribute       isInviteOnly    是否只允许受邀请者参加
 * @attribute       isInviteEnabled 是否能够邀请参加
 * @attribute       participants    活动参与者数量
 * @attribute       wishers         活动感兴趣者数量
 * @method          createFromJson  由豆瓣返回的JSON，初始化数据
 */
var Event = $.klass(DoubanObject, {
    init: function($super, data) {
        this.all = ['id', 'title', 'owner', 'category', 'location', 'startTime', 'endTime', 'summary', 'content', 'url', 'imageUrl', 'isInviteOnly', 'isInviteEnabled', 'participants', 'wishers', 'address' ];
        $super(data);
    }
});
// Class methods
/* create POST or PUT xml
 * @param       data, Object
 * @data        content, String
 */
Event.createXml = function(data) {
    data = $.extend({ category: 'music', title: '', content: '',
                      isInviteOnly: false, isInviteEnabled: true,
                      startTime: new Date(), endTime: new Date(),
                      address: ''
                    }, data || {});
    var isInviteOnly = data.isInviteOnly == true ? 'yes' : 'no';
    var isInviteEnabled = data.isInviteEnabled == true ? 'yes' : 'no';
    var startTime = $.parseDate(data.startTime);
    var endTime = $.parseDate(data.endTime);
    var xml = '<?xml version="1.0" encoding="UTF-8"?><entry xmlns="http://www.w3.org/2005/Atom" xmlns:db="http://www.douban.com/xmlns/" xmlns:gd="http://schemas.google.com/g/2005" xmlns:opensearch="http://a9.com/-/spec/opensearchrss/1.0/"><title>{TITLE}</title><category scheme="http://www.douban.com/2007#kind" term="http://www.douban.com/2007#event.{CATEGORY}"/><content>{CONTENT}</content><db:attribute name="invite_only">{IS_INVITE_ONLY}</db:attribute><db:attribute name="can_invite">{IS_INVITE_ENABLED}</db:attribute><gd:when endTime="{END_TIME}" startTime="{START_TIME}"/><gd:where valueString="{ADDRESS}"></gd:where></entry>';
    return xml.replace(/\{TITLE\}/, data.title)
              .replace(/\{CATEGORY\}/, data.category)
              .replace(/\{CONTENT\}/, data.content)
              .replace(/\{IS_INVITE_ONLY\}/, isInviteOnly)
              .replace(/\{IS_INVITE_ENABLED\}/, isInviteEnabled)
              .replace(/\{START_TIME\}/, startTime)
              .replace(/\{END_TIME\}/, endTime)
              .replace(/\{ADDRESS\}/, data.address);
};
Event.createRemoveXml = function(data) {
    data = $.extend({ reason: "对不起，活动因故取消了" }, data || {});
    var xml = '<?xml version="1.0" encoding="UTF-8"?><entry xmlns:ns0="http://www.w3.org/2005/Atom" xmlns:db="http://www.douban.com/xmlns/"><content>{REASON}</content></entry>';
    return xml.replace(/\{REASON\}/, data.reason);
};

/* Douban event entry
 */
var EventEntry = $.klass(DoubanObjectEntry, {
    init: function($super, data) {
        this.model = Event;
        $super(data);
    }
});

/* Douban search event entry
 */
var EventSearchEntry = $.klass(SearchEntry, {
    init: function($super, data) {
        this.model = Event;
        $super(data);
    }
});
