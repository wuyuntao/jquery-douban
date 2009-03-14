/* Douban Review API Service
 * @method      get             获取评论信息
 * @method      getForUser      特定用户的所有评论
 * @method      getForSubject   特定书籍、电影、音乐的所有评论
 * @method      add             发布新评论
 * @method      update          修改评论
 * @method      remove          删除评论
 */
var ReviewService = $.klass(CommonService, {
    init: function($super, service) {
        this._model = Review;
        this._modelEntry = ReviewForUserEntry;
        this._getObjectUrl = GET_REVIEW_URL;
        this._addObjectUrl = ADD_REVIEW_URL;
        this._suffix = '/reviews';
        $super(service);
    },

    getForSubject: function(subject, offset, limit, callback) {
        return this._getForObject(subject, offset, limit, callback, ReviewForSubjectEntry, null, '/reviews');
    }
});

/* Douban review entry
 * @param           data            Well-formatted json feed
 * @attribute       id              评论ID
 * @attribute       title           评论标题
 * @attribute       author          评论作者，User object
 * @attribute       summary         评论摘要
 * @attribute       content         评论全文
 * @attribute       published       评论发布时间
 * @attribute       updated         评论最近更新时间
 * @attribute       url             评论URL
 * @attribute       rating          评论对条目的评分
 * @method          createFromJson  由豆瓣返回的JSON，初始化数据
 */
var Review = $.klass(DoubanObject, {
    init: function($super, data) {
        this.all = ['id', 'title', 'author', 'subject', 'summary', 'content', 'published', 'updated', 'url', 'rating'];
        $super(data);
    }
});
// Class methods
/* create POST or PUT xml
 * @param       data, Object
 * @data        review, Object or String
 * @data        title, String
 * @data        content, String
 * @data        rating, Integer
 */
Review.createXml = function(data) {
    data = $.extend({ subject: '', title: '', content: '', rating: 3 },
                    data || {});
    if (typeof data.subject == 'object') var id = data.subject.id;
    else var id = data.subject;
    var xml = '<?xml version="1.0" encoding="UTF-8"?><entry xmlns:ns0="http://www.w3.org/2005/Atom"><db:subject xmlns:db="http://www.douban.com/xmlns/"><id>{ID}</id></db:subject><content>{CONTENT}</content><gd:rating xmlns:gd="http://schemas.google.com/g/2005" value="{RATING}" ></gd:rating><title>{TITLE}</title></entry>';
    return xml.replace(/\{ID\}/, id)
              .replace(/\{TITLE\}/, data.title)
              .replace(/\{CONTENT\}/, data.content)
              .replace(/\{RATING\}/, data.rating);
};

/* Douban review for user entry
 */
var ReviewForUserEntry = $.klass(AuthorEntry, {
    init: function($super, data) {
        this.model = Review;
        $super(data);
    }
});

/* Douban review for subject entry
 */
var ReviewForSubjectEntry = $.klass(DoubanObjectEntry, {
    init: function($super, data) {
        this.model = Review;
        $super(data);
    }
});
