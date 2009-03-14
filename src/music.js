/* Douban Music API Service
 * @method      get         获取音乐信息
 * @method      search      搜索音乐
 */
var MusicService = $.klass(SubjectService, {
    init: function($super, service) {
        this._model = Music;
        this._modelEntry = MusicEntry;
        this._getSubjectUrl = GET_MUSIC_URL;
        this._searchSubjectUrl = SEARCH_MUSIC_URL;
        $super(service);
    }
});

/* Douban music class
 * @param           data            Well-formatted json feed
 * @attribute       id              唱片ID
 * @attribute       title           唱片名
 * @attribute       aka             又名
 * @attribute       artists         表演者
 * @attribute       ean             EAN
 * @attribute       releaseDate     发布时间
 * @attribute       media           媒介
 * @attribute       discs           唱片书
 * @attribute       version         版本特性
 * @attribute       summary         唱片简介
 * @attribute       track           曲目
 * @attribute       url             条目URL
 * @attribute       imageUrl        封面URL
 * @attribute       tags            被标记最多的TAG
 * @attribute       rating          平均得分
 * @attribute       votes           投票人数
 * @method          createFromJson  由豆瓣返回的JSON，初始化数据
 */
var Music = $.klass(DoubanObject, {
    init: function($super, data) {
        this.all = ['id', 'title', 'aka', 'artists', 'ean', 'releaseDate', 'publisher', 'media', 'discs', 'version', 'summary', 'tracks', 'url', 'imageUrl', 'tags', 'rating', 'votes'];
        $super(data);
    }
});

/* Douban music entry
 */
var MusicEntry = $.klass(SearchEntry, {
    init: function($super, data) {
        this.model = Music;
        $super(data);
    }
});
