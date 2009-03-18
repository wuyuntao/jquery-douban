var reList = /(aka|cast|country|language|singer|author|director|translator|writer)/,
    reBool = /(privacy|can_reply|invite_only|can_invite)/,
    reTrue = /(public|yes)/;

Douban.user = function(feed) {
    return Parser.isEntry(feed) ? new Parser(feed).entries(Douban.user) :
        new Parser(feed).attr('id').attr('uri', 'id')
                        .attr('db:uid')
                        .attr('title', 'name').attr('name')
                        .attr('db:location')
                        .attr('content', 'intro')
                        .links({ 'alternate': 'home',
                                 'icon': 'image',
                                 'homepage': 'blog' });
};

Douban.subject = function(feed) {
    return Parser.isEntry(feed) ? new Parser(feed).entries(Douban.subject) :
        new Parser(feed).cat()
                        .attr('id')
                        .attr('title')
                        .attr('summary')
                        .attrs({ 'pubdate': 'releaseDate',
                                 'singer': 'artist' })
                        .links({ 'alternate': 'home' })
                        .rating()
                        .tags();
},

Douban.collection = function(feed) {
    return Parser.isEntry(feed) ? new Parser(feed).entries(Douban.collection) :
        new Parser(feed).attr('id')
                        .attr('title')
                        .attr('author', 'owner', Douban.user)
                        .attr('db:subject', Douban.subject)
                        .attr('summary')
                        .attr('updated')
                        .attr('db:status')
                        .rating()
                        .tags();
},

Douban.review = function(feed) {
    return Parser.isEntry(feed) ? new Parser(feed).entries(Douban.review) :
        new Parser(feed).attr('id')
                        .attr('title')
                        .attr('author', Douban.user)
                        .attr('db:subject', Douban.subject)
                        .attr('summary')
                        .attr('published')
                        .attr('updated')
                        .links({ 'alternate': 'home',
                                 'http://www.Douban.com/2007#subject': 'subject' })
                        .rating();
},

Douban.miniblog = function(feed) {
    return Parser.isEntry(feed) ? new Parser(feed).entries(Douban.miniblog) :
        new Parser(feed).cat()
                        .attr('id')
                        .attr('title')
                        .attr('content')
                        .attr('published')
                        .attrs({ 'category': 'subcategory' })
                        .links({});
},

Douban.recommendation = function(feed) {
    return Parser.isEntry(feed) ? new Parser(feed).entries(Douban.recommendation) :
        new Parser(feed).attr('id')
                        .attr('title')
                        .attr('content')
                        .attr('published')
                        .attrs({})
                        .links({});
},

Douban.comment = function(feed) {
    // Recommendation comment
    return Parser.isEntry(feed) ? new Parser(feed).entries(Douban.comment) :
        new Parser(feed).attr('id')
                        .attr('author', Douban.user)
                        .attr('published')
                        .attr('content');
},

Douban.note = function(feed) {
    return Parser.isEntry(feed) ? new Parser(feed).entries(Douban.note) :
        new Parser(feed).attr('id')
                        .attr('author', Douban.user)
                        .attr('title')
                        .attr('summary')
                        .attr('content')
                        .attr('published')
                        .attr('updated')
                        .attrs({ 'privacy': 'isPublic',
                                 'can_reply': 'isReplyEnabled' })
                        .links({ 'alternate': 'home' });
},

Douban.event = function(feed) {
    return Parser.isEntry(feed) ? new Parser(feed).entries(Douban.event) :
        new Parser(feed).cat()
                        .attr('id')
                        .attr('author', 'owner', Douban.user)
                        .attr('title')
                        .attr('db:location')
                        .attrs({ 'invite_only': 'isInviteOnly',
                                 'can_invite': 'isInviteEnabled' })
                        .eventContent()
                        .when().where()
                        .links({ 'alternate': 'home' });
},

Douban.tag = function(feed) {
    return Parser.isEntry(feed) ? new Parser(feed).entries(Douban.tag) :
        new Parser(feed).tag();
},
Douban.book = Douban.movie = Douban.music = Douban.subject;

var Parser = function(json) {
    this.raw = json;
    this.all = [];
};

Parser.prototype = {
    add: function() {
        for (var i = 0, ilen = arguments.length; i < ilen; ++i) {
            var found = false;
            for (var j = 0, jlen = this.all.length; j < jlen; ++j)
                if (this.all[j] == arguments[i]) {
                    found = true;
                    break;
                }
            if (!found) this.all = this.all.concat(arguments[i]);
        }
        return this;
    },

    eventContent: function() {
        this['summary'] = this.raw['summary'][0]['$t'];
        this['content'] = this.raw['content'][0]['$t'];
        return this;
    },

    attr: function(name, rename, parser) {
        // Shift arguments if rename is omitted
        if (typeof rename != 'string') {
            parser = rename;
            rename = null;
        }
        rename = rename ? rename : name.replace(/^\w+:/, '');
        if (this.raw[name]) {
            this[rename] = parser ? parser(this.raw[name]) : this.raw[name].$t;
            this.add(rename);
        }
        return this;
    },

    attrs: function(names) {
        // Parse attributes in <db:attribute> section
        var attrs = this.raw['db:attribute'];
        if (attrs)
            for (var i = 0, len = attrs.length; i < len; ++i) {
                var name = attrs[i]['@name'];
                var rename = names[name] ? names[name] : name.replace(/^\w+:/, '');
                // Parse chinese title
                if (name == 'aka' && attrs[i]['@lang'] == 'zh_CN') {
                    this['chineseTitle'] = attrs[i]['$t'];
                    this.add('chineseTitle');
                }
                if (name.match(reList)) {
                    if (!this[rename]) this[rename] = [];
                    this[rename].push(attrs[i]['$t']);
                } else if (name.match(reBool)) {
                    this[rename] = attrs[i]['$t'].match(reTrue) ? true : false;
                }else {
                    this[rename] = attrs[i]['$t'];
                }
                this.add(rename);
            }
        return this;
    },

    cat: function() {
        var cat = this.raw.category;
        this.category = (cat[0] ? cat[0] : cat)['@term'].match(/#(\w+\.)?(\w+)$/)[2];
        this.add('category');
        return this;
    },

    entries: function(parser) {
        this.openSearch().attr('title');
        if (this.raw.author)
            this.author = Douban.user(this.raw.author);
        if (this.raw.link)
            this.links({ 'alternate': 'home' });
        this.entry = [];
        for (var i = 0, len = this.raw.entry.length; i < len; ++i) {
            this.entry.push(parser(this.raw.entry[i]));
        }
        this.add('entry');
        return this;
    },

    links: function(names) {
        if (this.raw.link) {
            this.link = {};
            for (var i = 0, len = this.raw.link.length; i < len; ++i) {
                var name = this.raw.link[i]['@rel'];
                var rename = names[name] ? names[name] : name;
                this.link[rename] = this.raw.link[i]['@href'];
            }
            this.add('link');
        }
        return this;
    },

    openSearch: function() {
        this.attr('opensearch:totalResults', 'total')
            .attr('opensearch:startIndex', 'offset')
            .attr('opensearch:itemsPerPage', 'limit');
        this.total = parseInt(this.total || '0');
        this.offset = parseInt(this.offset || '1') - 1;
        this.limit = parseInt(this.limit || '0');
        this.add('total', 'offset', 'limit');
        return this;
    },

    rating: function() {
        var rating = this.raw['gd:rating'];
        if (rating) {
            this.rating = {
                min: parseInt(rating['@min']),
                votes: parseInt(rating['@numRaters']),
                average: parseFloat(rating['@average']),
                max: parseInt(rating['@max']),
                value: parseInt(rating['@value'])
            };
        }
        return this;
    },

    when: function() {
        var when = this.raw['gd:when'];
        if (when)
            this.time = {
                start: when['@startTime'],
                end: when['@endTime']
            }
        return this;
    },

    where: function() {
        var where = this.raw['gd:where'];
        if (where) this.address = where['@valueString'];
        return this;
    },

    tag: function() {
        if (this.raw['@name']) {
            // Parse tag in subject feed
            this.name = this.raw['@name'];
            this.count = parseInt(this.raw['@count']);
            this.add('name', 'count');
        } else {
            // Parse tag in tag feed
            this.attr('id').attr('db:count').attr('title', 'name');
            this.add('id', 'count', 'name');
        }
        return this;
    },

    tags: function() {
        this.tag = [];
        this.add('tag');
        var tags = this.raw['db:tag'];
        if (tags) {
            for (var i = 0, len = tags.length; i < len; ++i)
                this.tag.push(Douban.tag(tags[i]));
        }
        return this;
    }
};
// Class methods
Parser.isEntry = function(feed) {
    return typeof feed.entry != 'undefined';
};
