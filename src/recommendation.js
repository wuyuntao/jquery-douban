/* Douban Recommendation API Service
 * @method      get             获取推荐
 * @method      getForUser      获取用户的所有推荐
 * @method      add             发表新推荐
 * @method      remove          删除推荐
 * @method      getComment      获取推荐回复
 * @method      addComment      发表新回复
 * @method      removeComment   删除回复
 */
var RecommendationService = $.klass(CommonService, {
    init: function($super, service) {
        this._model = Recommendation;
        this._modelEntry = RecommendationEntry;
        this._getObjectUrl = GET_RECOMMENDATION_URL;
        this._addObjectUrl = ADD_RECOMMENDATION_URL;
        this._suffix = '/recommendations';
        // Mask ``update`` method
        this.update = undefined;
        $super(service);
    },

    getComment: function(recommendation, offset, limit, callback) {
        return this._getForObject(recommendation, offset, limit, callback, CommentEntry, GET_RECOMMENDATION_URL, '/comments');
    },

    addComment: function(recommendation, data, callback) {
        var url = this.lazyUrl(recommendation, GET_RECOMMENDATION_URL) + '/comments';
        return this._add(data, callback, url, Comment);
    },

    removeComment: function(comment, callback) {
        return this._remove(comment, callback);
    }
});

/* Douban recommendation class
 * @param           data            Well-formatted json feed
 * @attribute       id              推荐ID
 * @attribute       title           推荐标题
 * @attribute       content         推荐全文
 * @attribute       published       推荐发布时间
 * @attribute       type            类别
 * @attribute       comment         评论
 * @method          createFromJson  由豆瓣返回的JSON，初始化数据
 */
var Recommendation = $.klass(DoubanObject, {
    init: function($super, data) {
        this.all = ['id', 'title', 'content', 'published', 'type', 'comment'];
        $super(data);
    }
});
// Class methods
/* create POST or PUT xml
 * @param       data, Object
 * @data        comment, String
 * @data        title, String
 * @data        url, String
 */
Recommendation.createXml = function(data) {
    data = $.extend({ comment: '', title: '', url: '' }, data || {});
    var xml = '<?xml version="1.0" encoding="UTF-8"?><entry xmlns="http://www.w3.org/2005/Atom" xmlns:gd="http://schemas.google.com/g/2005" xmlns:opensearch="http://a9.com/-/spec/opensearchrss/1.0/" xmlns:db="http://www.douban.com/xmlns/"><title>{TITLE}</title><db:attribute name="comment">{COMMENT}</db:attribute><link href="{URL}" rel="related" /></entry>';
    return xml.replace(/\{COMMENT\}/, data.comment)
              .replace(/\{URL\}/, data.url)
              .replace(/\{TITLE\}/, data.title);
};

/* Douban recommendation entry
 */
var RecommendationEntry = $.klass(AuthorEntry, {
    init: function($super, data) {
        this.model = Recommendation;
        $super(data);
    }
});

/* Douban recommendation comment class
 * @param           data            Well-formatted json feed
 * @attribute       id              回复ID
 * @attribute       author          回复者，User object
 * @attribute       content         回复全文
 * @attribute       published       回复发布时间
 * @method          createFromJson  由豆瓣返回的JSON，初始化数据
 */
var Comment = $.klass(DoubanObject, {
    init: function($super, data) {
        this.all = ['id', 'author', 'published', 'content'];
        $super(data);
    }
});
// Class methods
/* create POST or PUT xml
 * @param       data, Object
 * @data        content, String
 */
Comment.createXml = function(data) {
    data = $.extend({ content: '' }, data || {});
    var xml = '<entry><content>{CONTENT}</content></entry>';
    return xml.replace(/\{CONTENT\}/, data.content);
};

/* Douban recommendation comment entry
 */
var CommentEntry = $.klass(AuthorEntry, {
    init: function($super, data) {
        this.model = Comment;
        $super(data);
    }
});
