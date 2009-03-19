var NOTE_URL = API_HOST + '/note',
    GET_NOTE_URL = NOTE_URL + '/{ID}';

// Douban Note API Service
var Note = Douban.service.note = function(service) {
    this.service = service;
};
Note.prototype = {
    // 获取日记
    get: function(note, callback) {
        this.service.get(note, callback, Douban.note, GET_NOTE_URL);
    },
    // 获取用户的所有日记
    getForUser: function(user, offset, limit, callback, extras) {
        this.service.entry(user, offset, limit, callback, Douban.note, GET_PEOPLE_URL + '/notes');
    },
    // 发表新日记
    add: function(data, callback) {
        this.service.add(data, callback, NOTE_URL + 's' , Douban.note);
    },
    // 更新日记
    update: function(note, data, callback) {
        this.service.update(note, data, callback, GET_NOTE_URL, Douban.note);
    },
    // 删除日记
    remove: function(note, callback) {
        this.service.remove(note, callback, GET_NOTE_URL);
    }
};

Douban.note.createXML = function(data) {
    var xml = '<?xml version="1.0" encoding="UTF-8"?><entry xmlns="http://www.w3.org/2005/Atom" xmlns:db="http://www.douban.com/xmlns/"><title>{TITLE}</title><content>{CONTENT}</content><db:attribute name="privacy">{PUBLIC}</db:attribute><db:attribute name="can_reply">{REPLY}</db:attribute></entry>';
    return xml.replace(/\{TITLE\}/, data.title || '')
              .replace(/\{CONTENT\}/, data.content || '')
              .replace(/\{PUBLIC\}/, !data.isPublic ? 'private' : 'public')
              .replace(/\{REPLY\}/, !data.isReplyEnabled ? 'no' : 'yes');
};
