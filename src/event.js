var EVENT_URL = API_HOST + '/event',
    GET_EVENT_URL = EVENT_URL + '/{ID}',
    GET_EVENT_FOR_CITY_URL = EVENT_URL + '/location/{ID}';

// Douban Event API Service
var Event = Douban.service.event = function(service) {
    this.service = service;
};
Event.prototype = {
    // 获取活动
    get: function(event, callback) {
        this.service.get(event, callback, Douban.event, GET_EVENT_URL);
    },
    // 获取参加活动的用户
    participants: function(event, offset, limit, callback) {
        this.service.entry(event, offset, limit, callback, Douban.user, GET_EVENT_URL + '/participants');
    },
    // 获取活动感兴趣的用户
    wishers: function(event, offset, limit, callback) {
        return this.service.entry(event, offset, limit, callback, Douban.user, GET_EVENT_URL + '/wishers');
    },
    // 获取用户的所有活动
    getForUser: function(user, offset, limit, callback, type) {
        return this.service.entry(user, offset, limit, callback, Douban.event, GET_PEOPLE_URL + '/events' + (type ? '/' + type : ''));
    },
    // 获取用户发起的活动
    getInitiateForUser: function(user, offset, limit, callback) {
        this.getForUser(user, offset, limit, callback, 'initiate');
    },
    // 获取用户参加的活动
    getParticipateForUser: function(user, offset, limit, callback) {
        this.getForUser(user, offset, limit, callback, 'participate');
    },
    // 获取用户感兴趣的活动
    getWishForUser: function(user, offset, limit, callback) {
        this.getForUser(user, offset, limit, callback, 'wish');
    },
    getForCity: function(city, offset, limit, callback, extras) {
        this.service.entry(city, offset, limit, callback, Douban.event, GET_EVENT_FOR_CITY_URL, extras);
    },
    // 搜索活动
    search: function(query, location, offset, limit, callback, extras) {
        this.service.search(query, offset, limit, callback, Douban.event, EVENT_URL + 's', { location: location || 'all' });
    },
    // TODO 创建新活动
    add: function(data, callback) {
        this.service.add(data, callback, EVENT_URL + 's' , Douban.event);
    },
    // TODO 更新活动
    update: function(event, data, callback) {
        this.service.update(event, data, callback, GET_EVENT_URL, Douban.event);
    },
    // TODO 删除活动。需要用 POST 方法提交删除原因
    remove: function(event, reason, callback) {
        var url = this.service.lazyURL(event, GET_EVENT_URL);
        this.service.add(reason, callback, url + '/delete');
    },
    // TODO 参加活动
    participate: function(event, callback) {
        var url = this.service.lazyURL(event, GET_EVENT_URL);
        this.service.add('', callback, url + '/participants');
    },
    // TODO 不参加活动
    notParticipate: function(event, callback) {
        var url = this.service.lazyURL(event, GET_EVENT_URL);
        this.service.remove(url + '/participants', callback);
    },
    // TODO 对活动感兴趣
    wish: function(event, callback) {
        var url = this.service.lazyURL(event, GET_EVENT_URL);
        this.service.add('', callback, url + '/wishers');
    },
    // TODO 对活动不感兴趣
    unwish: function(event, callback) {
        var url = this.service.lazyURL(event, GET_EVENT_URL);
        this.service.remove(url + '/wishes', callback);
    }
};

Douban.event.createXML = function(data) {
    var xml = '<?xml version="1.0" encoding="UTF-8"?><entry xmlns="http://www.w3.org/2005/Atom" xmlns:db="http://www.douban.com/xmlns/" xmlns:gd="http://schemas.google.com/g/2005" xmlns:opensearch="http://a9.com/-/spec/opensearchrss/1.0/"><title>{TITLE}</title><category scheme="http://www.douban.com/2007#kind" term="http://www.douban.com/2007#event.{CATEGORY}"/><content>{CONTENT}</content><db:attribute name="invite_only">{INVITE_ONLY}</db:attribute><db:attribute name="can_invite">{INVITE_ENABLED}</db:attribute><gd:when endTime="{END_TIME}" startTime="{START_TIME}"/><gd:where valueString="{ADDRESS}"></gd:where></entry>',
        isInviteOnly = typeof data.isInviteOnly == 'undefined' ? false : data.isInviteOnly,
        isInviteEnabled = typeof data.isInviteEnabled == 'undefined' ? true : data.isInviteOnly,
        startTime = Douban.util.parseDate(data.startTime || new Date()),
        endTime = Douban.util.parseDate(data.endTime || new Date());
    return xml.replace(/\{TITLE\}/, data.title || '')
              .replace(/\{CATEGORY\}/, data.category || 'music')
              .replace(/\{CONTENT\}/, data.content || '')
              .replace(/\{INVITE_ONLY\}/,  isInviteOnly ? 'yes' : 'no')
              .replace(/\{INVITE_ENABLED\}/, isInviteEnabled ? 'yes' : 'no')
              .replace(/\{START_TIME\}/, startTime)
              .replace(/\{END_TIME\}/, endTime)
              .replace(/\{ADDRESS\}/, data.address || '');
};

Douban.event.createRemoveXML = function(data) {
    var xml = '<?xml version="1.0" encoding="UTF-8"?><entry xmlns:ns0="http://www.w3.org/2005/Atom" xmlns:db="http://www.douban.com/xmlns/"><content>{REASON}</content></entry>';
    return xml.replace(/\{REASON\}/, data.reason || "对不起，活动因故取消了");
};
