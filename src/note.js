/* Douban Note API Service
 * @method      get             获取日记
 * @method      getForUser      获取用户的所有日记
 * @method      add             发表新日记
 * @method      update          更新日记
 * @method      remove          删除日记
 */
var NoteService = $.klass(CommonService, {
    init: function($super, service) {
        this._model = Note;
        this._modelEntry = NoteEntry;
        this._getObjectUrl = GET_NOTE_URL;
        this._addObjectUrl = ADD_NOTE_URL;
        this._suffix = '/notes';
        $super(service);
    }
});

/* Douban note class
 * @param           data            Well-formatted json feed
 * @attribute       id              日记ID
 * @attribute       title           日记标题
 * @attribute       author          日记作者，User object
 * @attribute       summary         日记摘要，如果设为全文输出，则和content相同
 * @attribute       content         日记全文
 * @attribute       published       日记发布时间
 * @attribute       updated         日记最近更新时间
 * @attribute       url             日记URL
 * @attribute       isPublic        是否公开
 * @attribute       isReplyEnabled  是否允许回复
 * @method          createFromJson  由豆瓣返回的JSON，初始化数据
 */
var Note = $.klass(DoubanObject, {
    init: function($super, data) {
        this.all = ['id', 'title', 'author', 'summary', 'content', 'published', 'updated', 'url', 'isPublic', 'isReplyEnabled'];
        $super(data);
    }
});
// Class methods
/* create POST or PUT xml
 * @param       data, Object
 * @data        title String
 * @data        content String
 * @data        isPublic Boolean (optional)
 * @data        isReplyEnabled Boolean (optional)
 */
Note.createXml = function(data) {
    data = $.extend({ title: '', content: '', isPublic: true,
                      isReplyEnabled: true },
                    data || {});
    var xml = '<?xml version="1.0" encoding="UTF-8"?><entry xmlns="http://www.w3.org/2005/Atom" xmlns:db="http://www.douban.com/xmlns/"><title>{TITLE}</title><content>{CONTENT}</content><db:attribute name="privacy">{IS_PUBLIC}</db:attribute><db:attribute name="can_reply">{IS_REPLY_ENABLED}</db:attribute></entry>';
    return xml.replace(/\{TITLE\}/, data.title)
              .replace(/\{CONTENT\}/, data.content)
              .replace(/\{IS_PUBLIC\}/, data.isPublic ? 'public' : 'private')
              .replace(/\{IS_REPLY_ENABLED\}/, data.isReplyEnabled ? 'yes' : 'no');
};

/* Douban note entries
 */
var NoteEntry = $.klass(AuthorEntry, {
    init: function($super, data) {
        this.model = Note;
        $super(data);
    }
});
