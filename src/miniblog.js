/* Douban Miniblog API Service
 * @method      getForUser          获取用户广播
 * @method      getForContact       获取用户友邻广播
 * @method      add                 添加广播
 * @method      remove              删除广播
 */
var MiniblogService = $.klass(CommonService, {
    init: function($super, service) {
        this._model = Miniblog;
        this._modelEntry = MiniblogEntry;
        this._getObjectUrl = GET_MINIBLOG_URL;
        this._addObjectUrl = ADD_MINIBLOG_URL;
        this._suffix = '/miniblog';
        // Mask ``get`` and ``update`` method
        this.get = undefined;
        this.udpate = undefined;
        $super(service);
    },

    getForContacts: function(user, offset, limit, callback) {
        return this._getForObject(user, offset, limit, callback, this._modelEntry, GET_PEOPLE_URL, '/miniblog/contacts');
    }
});

/* Douban miniblog class
 * @param           data            Well-formatted json feed
 * @attribute       id              广播ID
 * @attribute       title           广播标题
 * @attribute       content         广播内容
 * @attribute       published       广播发布时间
 * @attribute       category        类别
 * @attribute       type            子类别
 * @attribute       imageUrl        相关图片链接
 * @method          createFromJson  由豆瓣返回的JSON，初始化数据
 */
var Miniblog = $.klass(DoubanObject, {
    init: function($super, data) {
        this.all = ['id', 'title', 'content', 'published', 'category', 'type', 'imageUrl'];
        $super(data);
    }
});
// Class methods
/* create POST or PUT xml
 * @param       data, Object
 * @data        content, String
 */
Miniblog.createXml = function(data) {
    data = $.extend({ content: '' }, data || {});
    var xml = '<?xml version="1.0" encoding="UTF-8"?><entry xmlns:ns0="http://www.w3.org/2005/Atom" xmlns:db="http://www.douban.com/xmlns/"><content>{CONTENT}</content></entry>';
    return xml.replace(/\{CONTENT\}/, data.content);
};

/* Douban miniblog entry
 */
var MiniblogEntry = $.klass(AuthorEntry, {
    init: function($super, data) {
        this.model = Collection;
        $super(data);
    }
});
