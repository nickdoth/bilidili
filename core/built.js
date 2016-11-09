(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var Lyric_1 = require('../music/Lyric');
(function (DanmakuType) {
    DanmakuType[DanmakuType["Rolling"] = 3] = "Rolling";
    DanmakuType[DanmakuType["Bottom"] = 4] = "Bottom";
    DanmakuType[DanmakuType["Top"] = 5] = "Top";
    DanmakuType[DanmakuType["Reverse"] = 6] = "Reverse";
    DanmakuType[DanmakuType["Absolute"] = 7] = "Absolute";
    DanmakuType[DanmakuType["Advanced"] = 8] = "Advanced";
})(exports.DanmakuType || (exports.DanmakuType = {}));
var DanmakuType = exports.DanmakuType;
var BilibiliDanmakuDocument = (function () {
    function BilibiliDanmakuDocument(text) {
        this.nodes = [];
        var xmldoc = (new DOMParser()).parseFromString(text, "text/xml");
        var list = xmldoc.getElementsByTagName('d');
        for (var i = 0; i < list.length; i++) {
            var line = parseLrcLine(list[i]);
            if (line !== null) {
                this.nodes.push(line);
            }
        }
    }
    BilibiliDanmakuDocument.prototype.getTimeLine = function () {
        var nodes = this.nodes;
        var timeLine = Lyric_1.TimeLine();
        for (var i = 0; i < nodes.length; i++) {
            timeLine.push({
                time: nodes[i].time,
                content_id: i,
                data: nodes[i]
            });
        }
        timeLine.sort(function (a, b) { return a.time > b.time ? 1 : -1; });
        return timeLine;
    };
    BilibiliDanmakuDocument.extname = 'xml';
    BilibiliDanmakuDocument.responseType = 'document';
    return BilibiliDanmakuDocument;
}());
exports.BilibiliDanmakuDocument = BilibiliDanmakuDocument;
function parseLrcLine(node) {
    var infoAttr = node.getAttribute('p');
    var info = infoAttr.split(',');
    return {
        time: parseFloat(info[0]),
        type: parseInt(info[1]),
        fontSize: parseInt(info[2]),
        color: parseInt(info[3]),
        timestamp: parseFloat(info[4]),
        poolId: parseInt(info[5]),
        userId: info[6],
        rowId: parseInt(info[7]),
        content: node.childNodes[0] ? node.childNodes[0].textContent : ' '
    };
}

},{"../music/Lyric":4}],2:[function(require,module,exports){
(function (__filename,__dirname){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var events_1 = require('events');
console.log(__dirname, __filename);
var devicePixelRatio = 1;
var DanmakuViewer = (function (_super) {
    __extends(DanmakuViewer, _super);
    function DanmakuViewer(video) {
        var _this = this;
        _super.call(this);
        this.video = video;
        this.viewList = [];
        this.defaultFontSize = 19 * devicePixelRatio;
        this.row = 1;
        this.maxRow = 13;
        this.rowBlocked = [];
        video.on('pause', function () { });
        range(0, this.maxRow - 1).forEach(function (n) { return _this.rowBlocked[n] = false; });
        setInterval(function () { return _this.row = 1; }, 1700);
    }
    Object.defineProperty(DanmakuViewer.prototype, "rollingDuration", {
        get: function () {
            return this._rollingDuration;
        },
        set: function (val) {
            this._rollingDuration = val;
            this.rollingSpeed = devicePixelRatio * this.screenWidth / this._rollingDuration;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DanmakuViewer.prototype, "screenWidth", {
        get: function () {
            return document.body.offsetWidth;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DanmakuViewer.prototype, "screenHeight", {
        get: function () {
            return document.body.offsetHeight * 0.8;
        },
        enumerable: true,
        configurable: true
    });
    DanmakuViewer.prototype.init = function () {
        this.rollingDuration = 8000;
        this.mainLoop();
    };
    DanmakuViewer.prototype.update = function (matches, timeLine) {
        for (var i = 0; i < matches.length; i++) {
            var dm = timeLine[matches[i]].data;
            var left = this.screenWidth;
            this.viewList.push({
                node: dm,
                top: this.dTop(),
                left: left,
                width: -1,
                fontSize: this.defaultFontSize,
                color: color(dm.color)
            });
        }
    };
    DanmakuViewer.prototype.destroy = function () {
    };
    DanmakuViewer.prototype.dTop = function () {
        console.time('dTop');
        var lineHeight = this.defaultFontSize * 2 + 2;
        var top;
        while (true) {
            if (this.row > this.maxRow) {
                top = lineHeight * (this.row++ - this.maxRow) + lineHeight / 2;
            }
            else {
                top = lineHeight * this.row++;
            }
            var maxLeft = Math.max.apply(Math, this.viewList.filter(function (n) { return n.top === top; })
                .map(function (n) { return n.width + n.left; }));
            console.log(top, maxLeft);
            if (maxLeft < this.screenWidth - 15) {
                break;
            }
            else {
                console.log('向其它行查找空余空间');
            }
        }
        if (this.row === this.maxRow * 2)
            this.row = 1;
        console.timeEnd('dTop');
        return top;
    };
    DanmakuViewer.prototype.recover = function () {
        this.emit('recover-request');
    };
    DanmakuViewer.prototype.suspend = function () {
        this.emit('suspend-request');
    };
    DanmakuViewer.prototype.suspendState = function (callback) {
        this.emit('suspend-query', callback);
    };
    DanmakuViewer.prototype.mainLoop = function () {
        var _this = this;
        var cd = new DanmakuDOM();
        cd.setSize(this.screenWidth, this.screenHeight);
        window.addEventListener('resize', function () {
            return cd.setSize(_this.screenWidth, _this.screenHeight);
        });
        var isSuspended = false;
        this.on('suspend-request', function () {
            isSuspended = true;
            _this.once('recover-request', function () {
                last = performance.now();
                isSuspended = false;
                requestAnimationFrame(handler);
            });
        });
        this.on('suspend-query', function (cb) {
            cb(isSuspended);
        });
        this.video.on('pause', function () {
            _this.suspend();
            _this.video.once('play', function () { return _this.recover(); });
        });
        var last = performance.now(), now = 0, mspf = 0;
        var handler;
        var doRealRender = true;
        requestAnimationFrame(handler = function (time) {
            if (isSuspended) {
                return;
            }
            now = performance.now();
            mspf = now - last;
            last = now;
            for (var i = 0; i < _this.viewList.length; i++) {
                var n = _this.viewList[i];
                if (!n.initialized) {
                    cd.initNode(n);
                    n.initialized = true;
                }
                n.left -= _this.rollingSpeed * mspf;
                cd.updateState(n);
                if (n.width < 0) {
                }
                if (n.left < 0 - n.width) {
                    cd.removeState(n);
                    _this.viewList.splice(i--, 1);
                }
            }
            if (doRealRender) {
                cd.render(_this.viewList);
            }
            doRealRender = !doRealRender;
            requestAnimationFrame(handler);
        });
        setInterval(function (_) {
            requestAnimationFrame(function (t) {
            });
        }, 400);
    };
    return DanmakuViewer;
}(events_1.EventEmitter));
exports.DanmakuViewer = DanmakuViewer;
function readableTime(sec) {
    var hh = Math.floor(sec / 3600);
    var mm = Math.floor(sec / 60 - hh * 60);
    var ss = Math.floor(sec - hh * 3600 - mm * 60);
    return hh + ":" + numFormat(mm) + ":" + numFormat(ss);
}
var DanmakuDOM = (function () {
    function DanmakuDOM() {
    }
    DanmakuDOM.prototype.setSize = function (x, y) {
    };
    DanmakuDOM.prototype.initNode = function (n) {
        if (!n.attachData) {
            n.attachData = document.createElement('span');
            n.attachData.innerHTML = n.node.content;
            n.attachData.style.top = n.top + 'px';
            n.attachData.style.color = "rgb(" + color(n.node.color).join(',') + ")";
            n.attachData.style.fontSize = n.fontSize + 'px';
            n.attachData.style.position = 'fixed';
            n.attachData.style.zIndex = '1900';
            n.attachData.style.fontWeight = 'bolder';
            n.attachData.style.textShadow = '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black';
            n.attachData.style.whiteSpace = 'nowrap';
            console.log(n.node.content, n.attachData);
            document.body.appendChild(n.attachData);
            var offsetWidth = n.attachData.offsetWidth;
            n.attachData.style.left = '-9999px';
            n.attachData.style.width = offsetWidth + 'px';
            n.width = offsetWidth;
        }
    };
    DanmakuDOM.prototype.updateState = function (n) {
    };
    DanmakuDOM.prototype.removeState = function (n) {
        document.body.removeChild(n.attachData);
    };
    DanmakuDOM.prototype.render = function (viewList) {
        viewList.forEach(function (n) {
            n.attachData.style.left = n.left + 'px';
        });
    };
    return DanmakuDOM;
}());
function numFormat(n) {
    if (n < 10) {
        return "0" + n;
    }
    else {
        return n.toString();
    }
}
function color(n) {
    var b = n & 0xff;
    n = n >> 8;
    var g = n & 0xff;
    var r = n >> 8;
    return [r, g, b];
}
function colorLightness(color) {
    var min = Math.min.apply(Math, color);
    var max = Math.max.apply(Math, color);
    return (min + max) / 2.0;
}
function range(from, to) {
    var ret = [];
    for (var i = from; i <= to; i++) {
        ret.push(i);
    }
    return ret;
}

}).call(this,"/danmaku/viewer.js","/danmaku")
},{"events":7}],3:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var events_1 = require('events');
var HTMLMedia = (function (_super) {
    __extends(HTMLMedia, _super);
    function HTMLMedia(elementOrType) {
        var _this = this;
        _super.call(this);
        if (!elementOrType) {
            elementOrType = 'audio';
        }
        if (typeof elementOrType === 'string') {
            var element = this.element = document.createElement(elementOrType);
            document.body.appendChild(element);
        }
        else {
            var element = this.element = elementOrType;
        }
        element.onplay = function (e) { return _this.emit('play', e); };
        element.onpause = function (e) { return _this.emit('pause', e); };
        element.ontimeupdate = function (e) { return _this.emit('timeupdate', _this.element.currentTime); };
        element.onended = function (e) { return _this.emit('ended', e); };
        element.onseeked = function (e) { return _this.emit('seeked', e); };
    }
    HTMLMedia.prototype.load = function (url) {
        this.element.src = url;
        return this.element.load();
    };
    HTMLMedia.prototype.getUrl = function () {
        return this.element.src;
    };
    HTMLMedia.prototype.play = function () {
        return this.element.play();
    };
    HTMLMedia.prototype.pause = function () {
        return this.element.pause();
    };
    HTMLMedia.prototype.setCurrentTime = function (time) {
        this.element.currentTime = time;
    };
    HTMLMedia.prototype.getCurrentTime = function () {
        return this.element.currentTime;
    };
    HTMLMedia.prototype.getDuration = function () {
        return this.element.duration;
    };
    HTMLMedia.prototype.setLoop = function (bool) {
        return this.element.loop = bool;
    };
    HTMLMedia.prototype.isPaused = function () {
        return this.element.paused;
    };
    HTMLMedia.prototype.isPlaying = function () {
        return !this.element.paused;
    };
    HTMLMedia.prototype.isLoop = function () {
        return this.element.loop;
    };
    HTMLMedia.prototype.isEnded = function () {
        return this.element.ended;
    };
    HTMLMedia.prototype.isLoaded = function () {
        return true;
    };
    return HTMLMedia;
}(events_1.EventEmitter));
exports.HTMLMedia = HTMLMedia;

},{"events":7}],4:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var events_1 = require('events');
var log = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i - 0] = arguments[_i];
    }
    return console.log.apply(console, args);
};
var Lyric = (function (_super) {
    __extends(Lyric, _super);
    function Lyric(media, DocCtor, data) {
        _super.call(this);
        this.media = media;
        this.DocCtor = DocCtor;
        this.data = data;
        this.enableCheck = false;
        if (!media) {
            throw new Error("Audio Element not specified.");
        }
        this.init(data);
    }
    Lyric.prototype.init = function (rawData, callback) {
        var _this = this;
        console.log('Lyric init');
        var isLoadTimeouted = false;
        var loadTimeout = setTimeout(function () {
            isLoadTimeouted = true;
            callback && callback();
        }, 1800);
        clearTimeout(loadTimeout);
        !isLoadTimeouted && callback && callback();
        var lrcDocument = this.lrcDocument = new this.DocCtor(rawData);
        var timeLine = lrcDocument.getTimeLine();
        this.emit('init', timeLine);
        log("时间线", [timeLine]);
        var currentLine = '';
        var checker;
        var timer;
        var matchStartPoint = 0;
        this.enableCheck = true;
        (checker = function () {
            var now = _this.media.getCurrentTime();
            var matchLines = timeLine.matchByTime(now, matchStartPoint);
            if (matchLines.toString() !== currentLine) {
                currentLine = matchLines.toString();
                matchStartPoint = matchLines[matchLines.length - 1];
                _this.emit('update', matchLines, timeLine);
            }
            timer = _this.enableCheck && setTimeout(checker, 5);
            if (!_this.enableCheck) {
                clearTimeout(timer);
            }
        })();
        this.media.on('seeked', function (e) {
            matchStartPoint = 0;
            console.log('seeked');
        });
    };
    Lyric.prototype.destroy = function () {
        if (this.enableCheck) {
            this.enableCheck = false;
            this.emit('destroy');
        }
    };
    Lyric.prototype.addView = function (view) {
        this.on('init', function (timeLine) { return view.init(timeLine); });
        this.on('update', function (matches, timeLine) { return view.update(matches, timeLine); });
        this.on('destroy', function () { return view.destroy(); });
    };
    Lyric.prototype.getDocumentInstance = function () {
        return this.lrcDocument;
    };
    return Lyric;
}(events_1.EventEmitter));
exports.Lyric = Lyric;
function matchByTime(time, startPoint) {
    if (startPoint === void 0) { startPoint = 0; }
    var timeLine = this;
    var ret = [];
    for (var i = startPoint; i < timeLine.length; i++) {
        var next = timeLine[i + 1] ? timeLine[i + 1].time : Infinity;
        if (timeLine[i].time <= time && next > time) {
            for (var e = i; timeLine[e] && (timeLine[e].time === timeLine[i].time); e--) {
                ret.push(e);
            }
            break;
        }
    }
    return ret;
}
function TimeLine() {
    var arr = [];
    arr.matchByTime = matchByTime;
    return arr;
}
exports.TimeLine = TimeLine;

},{"events":7}],5:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var events_1 = require('events');
var g = window;
var CkPlayerWrapperMedia = (function (_super) {
    __extends(CkPlayerWrapperMedia, _super);
    function CkPlayerWrapperMedia(id) {
        var _this = this;
        _super.call(this);
        this.sk = null;
        this.currentTime = 0;
        this.paused = false;
        if (typeof CKobject !== 'object') {
            throw new Error('ckplayer not found');
        }
        this.sk = CKobject.getObjectById(id);
        if (!this.sk)
            throw new Error('ckplayer instance not found');
        console.log(this.sk);
        g.dmkev_time = function (time) {
            _this.emit('timeupdate', time);
            _this.currentTime = time;
        };
        g.dmkev_paused = function (paused) {
            _this.paused = paused;
            if (paused) {
                _this.emit('pause');
            }
            else {
                _this.emit('play');
            }
        };
        g.dmkev_seeking = function (time) {
            _this.emit('seeked');
        };
        this.sk.addListener('time', 'dmkev_time');
        this.sk.addListener('paused', 'dmkev_paused');
        this.sk.addListener('seeking', 'dmkev_seeking');
    }
    CkPlayerWrapperMedia.prototype.load = function (url) { };
    CkPlayerWrapperMedia.prototype.getUrl = function () { return ''; };
    CkPlayerWrapperMedia.prototype.play = function () { };
    CkPlayerWrapperMedia.prototype.pause = function () { };
    CkPlayerWrapperMedia.prototype.setCurrentTime = function (percent) { };
    CkPlayerWrapperMedia.prototype.getCurrentTime = function () {
        return this.currentTime;
    };
    CkPlayerWrapperMedia.prototype.getDuration = function () {
        return 0;
    };
    ;
    CkPlayerWrapperMedia.prototype.setLoop = function (loop) { };
    CkPlayerWrapperMedia.prototype.isPaused = function () {
        return this.paused;
    };
    CkPlayerWrapperMedia.prototype.isPlaying = function () {
        return !this.paused;
    };
    CkPlayerWrapperMedia.prototype.isLoop = function () { return false; };
    ;
    CkPlayerWrapperMedia.prototype.isEnded = function () { return false; };
    ;
    CkPlayerWrapperMedia.prototype.isLoaded = function () { return true; };
    ;
    return CkPlayerWrapperMedia;
}(events_1.EventEmitter));
exports.CkPlayerWrapperMedia = CkPlayerWrapperMedia;

},{"events":7}],6:[function(require,module,exports){
"use strict";
var Lyric_1 = require('./music/Lyric');
var bilibili_1 = require('./danmaku/bilibili');
var viewer_1 = require('./danmaku/viewer');
var HTMLMedia_1 = require('./media/HTMLMedia');
var skplayer_1 = require('./skplayer');
function danmaku(media, text) {
    var lrc = new Lyric_1.Lyric(media, bilibili_1.BilibiliDanmakuDocument, text);
    var dmv = window.dmv = new viewer_1.DanmakuViewer(media);
    lrc.addView(dmv);
    dmv.init();
}
function loadAndPlay(media) {
    window.addEventListener('bdctrl-restext', function (evt) {
        danmaku(media, document.getElementById('restext').innerHTML);
    });
    window.dispatchEvent(new Event('bdcore-ready'));
}
var pending;
(function waitPlayerReady() {
    if (typeof CKobject === 'object' && CKobject.getObjectById('ckplayer_a1').addListener) {
        clearTimeout(pending);
        setInterval(function () {
            document.querySelector('object').setAttribute('height', window.innerHeight + '');
            CKobject.getObjectById('ckplayer_a1').setAttribute('height', window.innerHeight);
        }, 1200);
        loadAndPlay(new skplayer_1.CkPlayerWrapperMedia('ckplayer_a1'));
        return;
    }
    else if (document.querySelector('video') !== null) {
        clearTimeout(pending);
        loadAndPlay(new HTMLMedia_1.HTMLMedia(document.querySelector('video')));
        return;
    }
    pending = setTimeout(waitPlayerReady, 300);
})();
window.danmaku = danmaku;

},{"./danmaku/bilibili":1,"./danmaku/viewer":2,"./media/HTMLMedia":3,"./music/Lyric":4,"./skplayer":5}],7:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}]},{},[6]);
