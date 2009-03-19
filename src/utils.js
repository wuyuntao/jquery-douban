Douban.util = {
    // Parse datetime string to Date object, or vice versa
    parseDate: function(datetime) {
        var re = /^(\d{4})\-(\d{2})\-(\d{2})T(\d{2}):(\d{2}):(\d{2})/;
        var tmpl = 'YY-MM-DDThh:mm:ss+08:00';
        if (typeof datetime == 'string') {
            var datetime = datetime.match(re);
            for (var i = 1, len = datetime.length; i < len; i++) {
                datetime[i] = parseInt(datetime[i], 10);
                if (i == 2) datetime[i] -= 1;
            }
            return new Date(datetime[1], datetime[2], datetime[3],
                            datetime[4], datetime[5], datetime[6]);
        } else if (typeof datetime == 'object') {
            return tmpl
                .replace(/YY/, Douban.util.padLeft(datetime.getFullYear()))
                .replace(/MM/, Douban.util.padLeft(datetime.getMonth() + 1))
                .replace(/DD/, Douban.util.padLeft(datetime.getDate()))
                .replace(/hh/, Douban.util.padLeft(datetime.getHours()))
                .replace(/mm/, Douban.util.padLeft(datetime.getMinutes()))
                .replace(/ss/, Douban.util.padLeft(datetime.getSeconds()));
        } 
    },

    padLeft: function(val, digit) {
        return val.toString().length >= (digit || 2) ? String(val) : Douban.util.padLeft('0' + val, digit);
    },

    // The opposiite of jQuery's native $.param() method.
    // Deserialises a parameter string to an object:
    unparam: function(params) {
        var obj = new Object();
        $.each(params.split('&'), function() {
            var param = this.split('=');
            var key = decodeURIComponent(param[0]);
            var value = decodeURIComponent(param[1]);
            obj[key] = value;
        });
        return obj;
    },

    buildUri: function(url, params, proxy) {
        url += (/\?/.test(url) ? '&' : '?') + $.param(params);
        if (proxy) url = proxy + encodeURIComponent(url);
        return url;
    }
};
