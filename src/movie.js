/* Douban Movie API Service
 * @method      get         获取电影信息
 * @method      search      搜索电影
 */
var MovieService = $.klass(SubjectService, {
    init: function($super, service) {
        this._model = Movie;
        this._modelEntry = MovieEntry;
        this._getSubjectUrl = GET_MOVIE_URL;
        this._searchSubjectUrl = SEARCH_MOVIE_URL;
        $super(service);
    }
});

/* Douban movie class
 * @param           data            Well-formatted json feed
 * @attribute       id              电影ID
 * @attribute       title           电影名
 * @attribute       chineseTitle    中文电影名
 * @attribute       aka             又名
 * @attribute       directors       导演
 * @attribute       writers         编剧
 * @attribute       cast            演员
 * @attribute       imdb            IMDB
 * @attribute       releaseDate     发布时间
 * @attribute       episode         集数
 * @attribute       language        语言
 * @attribute       country         国家
 * @attribute       summary         电影简介
 * @attribute       url             条目URL
 * @attribute       imageUrl        海报URL
 * @attribute       website         官方网站
 * @attribute       tags            被标记最多的TAG
 * @attribute       rating          平均得分
 * @attribute       votes           投票人数
 * @method          createFromJson  由豆瓣返回的JSON，初始化数据
 */
var Movie = $.klass(DoubanObject, {
    init: function($super, data) {
        this.all = ['id', 'title', 'chineseTitle', 'aka', 'directors', 'writers', 'cast', 'imdb', 'releaseDate', 'episode', 'language', 'country', 'summary', 'url', 'imageUrl', 'website', 'tags', 'rating', 'votes'];
        $super(data);
    }
});

/* Douban movie entry
 */
var MovieEntry = $.klass(SearchEntry, {
    init: function($super, data) {
        this.model = Movie;
        $super(data);
    }
});
