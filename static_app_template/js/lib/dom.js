
var __dom__ = function() {
    var scriptTag = function(src, callback) {
        var doc = document;
        var s = doc.createElement('script');
        s.type = 'text/' + (src.type || 'javascript');
        s.src = src.src || src;
        s.async = false;

        s.onreadystatechange = s.onload = function() {

            var state = s.readyState;

            if (!callback.done && (!state || /loaded|complete/.test(state))) {
                callback.done = true;
                callback();
            }
        };

        // use body if available. more safe in IE
        doc.body.appendChild(s);
    };

    var addScripts = function(paths, i, cb) {
        if (i >= paths.length) {
            cb();
        } else {
            scriptTag(paths[i], function() {
                addScripts(paths, i+1, cb);
            });
        }
    };

    var Dom = function() {

    };

    Dom.prototype = {
        _processLinks: function (node) {
            var me = this;

            node.find('a[data-link-type="static"]').each(function () {
                console.log('process static link');
                var nd = $(this);
                var name = nd.data('app-name');
                var rest = nd.data('link-rest');
                var href = me._getHrefPrefix(name) + (rest || '');
                console.log(href);
                nd.attr('href', href);
            });

            node.find('a[data-link-type="dynamic"]').each(function() {
                var nd = $(this);
                var href = nd.attr('href');
                var host = __properties__[__env__]['dynamic-host'];

                nd.attr('href', host + href);
            });
        },

        _getHrefPrefix: function (name) {
            if (__env__ == 'dev') {
                return '/app/' + name + '/' + name + '.html';
            } else {
                return '/' + name + '/';
            }
        },

        loadHTML: function (url, cssSelector, cb) {
            var me = this;

            var node = $('<div id="__foo__"></div>');
            $('body').append(node);
            node.load(url + ' ' + cssSelector, function (response, status, xhr) {
                if (status == "error") {
                    cb(response);
                } else {
                    me._processLinks(node);
                    // var htmlText = node.find(cssSelector).html();
                    var htmlText = node.find(cssSelector)[0].outerHTML;
                    node.remove();
                    cb(null, htmlText);
                }
            });
        },

        addScript: function (name, cb) {
            var paths = this._jscss['js'][name];
            addScripts(paths, 0, cb);
        },

        addStyle: function(name, cb) {
            var paths = this._jscss['css'][name];
            for (var i = 0; i < paths.length; i++) {
                var path = paths[i];
                $('head').append($('<link rel="stylesheet" href="' + path + '"/>'));
            }
            cb();
        },

        loadJSCSS: function (cb) {
            var me = this;

            // $.getJSON('/js_css.json', success);
            $.ajax({
                url: '/js_css.json',
                cache: false,
                dataType: 'text',
                success: function (o) {
                    me._jscss = eval('(' + o + ')');
                    cb();
                },
                error: function(e) {
                    cb(e);
                }
            });
        },

        loadJSON: function(url, cb) {
            $.getJSON(url, function(o) {
                cb(null, o);
            });
        },

        setEnv: function() {

        },

        setJQuery: function() {

        }
    };

    var dom = new Dom();
    return dom;
}();

