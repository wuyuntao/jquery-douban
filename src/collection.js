/* Douban Collection API Service
 * @method      get             获取收藏信息
 * @method      getForUser      获取用户收藏信息
 * @method      add             添加收藏
 * @method      update          更新收藏信息
 * @method      remove          删除收藏
 */
var CollectionService = $.klass(CommonService, {
    init: function($super, service) {
        this._model = Collection;
        this._modelEntry = CollectionEntry;
        this._getObjectUrl = GET_COLLECTION_URL;
        this._addObjectUrl = ADD_COLLECTION_URL;
        this._suffix = '/collection';
        $super(service);
    },

    /* 
     * @argument    params          可选参数包括：
     * tag  	    搜索特定tag的收藏  	
     * status 	    搜索特定状态的收藏 	
     *      book:   [wish, reading, read]
     *      movie:  [wish, watched]
     *      tv:     [wish, watching, watched]
     *      music:  [wish, listening, listened]
     * updated-max 	收藏的最晚时间 	格式: 2007-12-28T21:47:00+08:00
     * updated-min 	收藏的最早时间 	格式: 2007-12-28T21:47:00+08:00
     */
    getForUser: function(user, offset, limit, callback, params) {
        return this._getForObject(user, offset, limit, callback, CollectionEntry, GET_PEOPLE_URL, '/collection', params);
    }
});

/* Douban collection class
 * @param           data            Well-formatted json feed
 * @attribute       id              收藏ID
 * @attribute       title           收藏标题
 * @attribute       author          收藏者，User object
 * @attribute       subject         收藏条目，Subject object
 * @attribute       content         收藏评论
 * @attribute       updated         收藏最近更新时间
 * @attribute       status          收藏状态，查表可去：http://tinyurl.com/59rqm2
 * @attribute       tags            收藏用TAG
 * @attribute       rating          收藏评分
 * @method          createFromJson  由豆瓣返回的JSON，初始化数据
 */
var Collection = $.klass(DoubanObject, {
    init: function($super, data) {
        this.all = ['id', 'title', 'owner', 'content', 'updated', 'subject', 'status', 'tags', 'rating'];
        $super(data);
    }
});
// Class methods
/* create POST or PUT xml
 * @param       data, Object
 * @data        subject, Object or String
 * @data        status, String
 * @data        content, String
 * @data        rating, Integer or String
 * @data        tags, List
 * @data        isPrivate, Boolean
 */
Collection.createXml = function(data) {
    data = $.extend({ subject: '', status: '', content: '', rating: 3,
                      tags: [], isPrivate: false },
                    data || {});
    if (typeof data.subject == 'object') var id = data.subject.id;
    else var id = data.subject;
    var xml = '<?xml version="1.0" encoding="UTF-8"?><entry xmlns:ns0="http://www.w3.org/2005/Atom" xmlns:db="http://www.douban.com/xmlns/"><db:subject><id>{ID}</id></db:subject><db:status>{STATUS}</db:status>{TAGS}<content>{CONTENT}</content><gd:rating xmlns:gd="http://schemas.google.com/g/2005" value="{RATING}" ></gd:rating><db:attribute name="privacy">{IS_PRIVATE}</db:attribute></entry>';
    for (var i = 0, tags = '', len = data.tags.length; i < len; i++) {
        tags += '<db:tag name="' + data.tags[i] + '"></db:tag>';
    }
    return xml.replace(/\{ID\}/, id)
              .replace(/\{STATUS\}/, data.status)
              .replace(/\{CONTENT\}/, data.content)
              .replace(/\{RATING\}/, data.rating)
              .replace(/\{TAGS\}/, tags)
              .replace(/\{IS_PRIVATE\}/, data.isPrivate ? 'private' : 'public');
};

/* Douban collection entry
 */
var CollectionEntry = $.klass(AuthorEntry, {
    init: function($super, data) {
        this.model = Collection;
        $super(data);
    }
});
