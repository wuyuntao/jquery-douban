// Add methods to class
// Copied from Low Pro for jQuery
// http://www.danwebb.net/2008/2/3/how-to-use-low-pro-for-jquery
function addMethods(source) {
    var ancestor   = this.superclass && this.superclass.prototype;
    var properties = $.keys(source);

    if (!$.keys({ toString: true }).length) 
        properties.push("toString", "valueOf");

    for (var i = 0, length = properties.length; i < length; i++) {
        var property = properties[i], value = source[property];
        if (ancestor && $.isFunction(value) && $.argumentNames(value)[0] == "$super") {
        
            var method = value, value = $.extend($.wrap((function(m) {
                return function() { return ancestor[m].apply(this, arguments) };
            })(property), method), {
                valueOf:  function() { return method },
                toString: function() { return method.toString() }
            });
        }
        this.prototype[property] = value;
    }
    return this;
}

$.extend({
    /* Get keys of an object
     */
    keys: function(obj) {
        var keys = [];
        for (var key in obj) keys.push(key);
        return keys;
    },

    /* Returns argument names of a function
     */
    argumentNames: function(func) {
        var names = func.toString().match(/^[\s\(]*function[^(]*\((.*?)\)/)[1].split(/, ?/);
        return names.length == 1 && !names[0] ? [] : names;
    },

    bind: function(func, scope) {
        return function() {
            return func.apply(scope, $.makeArray(arguments));
        }
    },

    wrap: function(func, wrapper) {
        var __method = func;
        return function() {
            return wrapper.apply(this, [$.bind(__method, this)].concat($.makeArray(arguments)));
        }
    },

    /* Class creation and inheriance.
     * Copied from Low Pro for jQuery
     * http://www.danwebb.net/2008/2/3/how-to-use-low-pro-for-jquery
     */
    klass: function() {
        var parent = null;
        var properties = $.makeArray(arguments);
        if ($.isFunction(properties[0])) parent = properties.shift();
        var klass = function() {
            this.init.apply(this, arguments);
        };
        klass.superclass = parent;
        klass.subclasses = [];
        klass.addMethods = addMethods;
        if (parent) {
            var subclass = function() { };
            subclass.prototype = parent.prototype;
            klass.prototype = new subclass;
            parent.subclasses.push(klass);
        }
        for (var i = 0, len = properties.length; i < len; i++)
            klass.addMethods(properties[i]);
        if (!klass.prototype.init)
            klass.prototype.init = function() {};
        klass.prototype.constructor = klass;
        return klass;
    },

    /* Parse datetime string to Date object, or vice versa
     */
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
            return tmpl.replace(/YY/, $.padLeft(datetime.getFullYear()))
                       .replace(/MM/, $.padLeft(datetime.getMonth() + 1))
                       .replace(/DD/, $.padLeft(datetime.getDate()))
                       .replace(/hh/, $.padLeft(datetime.getHours()))
                       .replace(/mm/, $.padLeft(datetime.getMinutes()))
                       .replace(/ss/, $.padLeft(datetime.getSeconds()));
        } else {
            throw new Error("Invalid datetime. String or Date object needed");
        }
    },

    padLeft: function(val, digit) {
        return val.toString().length >= (digit || 2) ? String(val) : $.padLeft('0' + val, digit);
    },

    /* The opposiite of jQuery's native $.param() method.
     * Deserialises a parameter string to an object:
     */
    unparam: function(params) {
        var obj = new Object();
        $.each(params.split('&'), function() {
            var param = this.split('=');
            var key = decodeURIComponent(param[0]);
            var value = decodeURIComponent(param[1]);
            obj[key] = value;
        });
        return obj;
    }
});

Douban.util = {
    buildUri: function(url, params, proxy) {
        url += (/\?/.test(url) ? '&' : '?') + $.param(params);
        if (proxy) url = proxy + encodeURIComponent(url);
        return url;
    }
};
