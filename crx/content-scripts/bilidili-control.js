(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var page_agent_1 = require('./page-agent');
var silly = page_agent_1.default.silly;
var cr = window.chrome;
var DILI_PLAYER = 'player.dilidili.tv';
if (location.hostname === DILI_PLAYER || location.protocol === 'file:') {
    silly('Getting URL...');
    var cacheKey = 'cache:' +
        (location.hostname === DILI_PLAYER ? getKeyByVid(location.href) : location.href);
    silly('Using cacheKey:', cacheKey);
    silly(location.protocol);
    cr.storage.local.get(cacheKey, function (items) {
        var url = items[cacheKey] || prompt('Input URL:');
        silly('url: ', url);
        var data = {};
        data[cacheKey] = url;
        cr.storage.local.set(data);
        cr.runtime.sendMessage(null, ['getdanmaku', url], {}, function (responseText) {
            if (!responseText) {
                silly('Error while fetch danmaku file, halt');
                return;
            }
            console.log('ctrl:location.origin', location.origin);
            page_agent_1.default.onMessage(function (msg) {
                if (!msg.requestDanmaku)
                    return;
                page_agent_1.default.postMessage({
                    responseDanmaku: responseText
                });
            });
            injectScript(cr.extension.getURL('/content-scripts/bilidili-core.js'), 'body');
        });
    });
}
else if (location.hostname === 'www.dilidili.com') {
    var toolbar = document.createElement('div');
    toolbar.innerHTML = Toolbar();
    var sx = document.querySelector('.player_sx');
    sx.parentElement.insertBefore(toolbar, sx);
    var cacheKey = 'cache:' + getKeyByVid(document.getElementById('player_iframe').src);
    silly('getKeyByVid(document.getElementById(\'player_iframe\').src', cacheKey);
    cr.storage.local.get(cacheKey, function (items) {
        var url = items[cacheKey];
        if (url)
            toolbar.innerHTML = Toolbar({ url: url });
    });
}
function Toolbar(props) {
    if (props === void 0) { props = { url: '' }; }
    return "\n    <div class=\"player_sx\" id=\"bilidili\">\n        <p style=\"float:left; margin-left:5px;\">\u5173\u95ED/\u5F00\u542F\u5F39\u5E55</p>\n        <p style=\"float:left; margin-left:5px;\" \n            onclick=\"document.querySelector('#player_iframe').webkitRequestFullscreen()\">\n            \u5E26\u5F39\u5E55\u5168\u5C4F\n        </p>\n        <p style=\"float:left; margin-left:5px;\">" + (decodeURIComponent(props.url) || '未加载弹幕。') + "</p>\n    </div>\n    ";
}
function getKeyByVid(href) {
    var ma = /vid=(\d+)/.exec(href);
    return ma && ma[1];
}
function injectScript(file, node) {
    var th = document.getElementsByTagName(node)[0];
    var s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('src', file);
    th.appendChild(s);
}

},{"./page-agent":2}],2:[function(require,module,exports){
"use strict";
var PageAgent = {
    onMessage: function (listener) {
        if (location.protocol === 'file:') {
            window.addEventListener('lo-message', function (ev) {
                listener(JSON.parse(document.getElementById('_msg_response').innerHTML));
            });
        }
        else {
            window.addEventListener('message', function (ev) { return listener(ev.data); });
        }
    },
    postMessage: function (data) {
        if (location.protocol === 'file:') {
            var ev = new Event('lo-message');
            var msgNode = document.getElementById('_msg_response') ||
                document.body.appendChild(document.createElement('script'));
            msgNode.id = '_msg_response';
            msgNode.type = 'application/json';
            msgNode.innerHTML = JSON.stringify(data);
            window.dispatchEvent(ev);
        }
        else {
            window.postMessage(data, location.origin);
        }
    },
    silly: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        console.log.apply(console, args);
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PageAgent;

},{}]},{},[1]);
