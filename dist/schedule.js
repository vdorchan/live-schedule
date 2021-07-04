
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':12345/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
(function (global, factory) {
typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
typeof define === 'function' && define.amd ? define(factory) :
(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Schedule = factory());
}(this, (function () { 'use strict';

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, basedir, module) {
	return module = {
	  path: basedir,
	  exports: {},
	  require: function (path, base) {
      return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
    }
	}, fn(module, module.exports), module.exports;
}

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
}

var _extends_1 = createCommonjsModule(function (module) {
function _extends() {
  module.exports = _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  module.exports["default"] = module.exports, module.exports.__esModule = true;
  return _extends.apply(this, arguments);
}

module.exports = _extends;
module.exports["default"] = module.exports, module.exports.__esModule = true;
});

var resizeObservers = [];

var hasActiveObservations = function () {
    return resizeObservers.some(function (ro) { return ro.activeTargets.length > 0; });
};

var hasSkippedObservations = function () {
    return resizeObservers.some(function (ro) { return ro.skippedTargets.length > 0; });
};

var msg = 'ResizeObserver loop completed with undelivered notifications.';
var deliverResizeLoopError = function () {
    var event;
    if (typeof ErrorEvent === 'function') {
        event = new ErrorEvent('error', {
            message: msg
        });
    }
    else {
        event = document.createEvent('Event');
        event.initEvent('error', false, false);
        event.message = msg;
    }
    window.dispatchEvent(event);
};

var ResizeObserverBoxOptions;
(function (ResizeObserverBoxOptions) {
    ResizeObserverBoxOptions["BORDER_BOX"] = "border-box";
    ResizeObserverBoxOptions["CONTENT_BOX"] = "content-box";
    ResizeObserverBoxOptions["DEVICE_PIXEL_CONTENT_BOX"] = "device-pixel-content-box";
})(ResizeObserverBoxOptions || (ResizeObserverBoxOptions = {}));

var freeze = function (obj) { return Object.freeze(obj); };

var ResizeObserverSize = (function () {
    function ResizeObserverSize(inlineSize, blockSize) {
        this.inlineSize = inlineSize;
        this.blockSize = blockSize;
        freeze(this);
    }
    return ResizeObserverSize;
}());

var DOMRectReadOnly = (function () {
    function DOMRectReadOnly(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.top = this.y;
        this.left = this.x;
        this.bottom = this.top + this.height;
        this.right = this.left + this.width;
        return freeze(this);
    }
    DOMRectReadOnly.prototype.toJSON = function () {
        var _a = this, x = _a.x, y = _a.y, top = _a.top, right = _a.right, bottom = _a.bottom, left = _a.left, width = _a.width, height = _a.height;
        return { x: x, y: y, top: top, right: right, bottom: bottom, left: left, width: width, height: height };
    };
    DOMRectReadOnly.fromRect = function (rectangle) {
        return new DOMRectReadOnly(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
    };
    return DOMRectReadOnly;
}());

var isSVG = function (target) { return target instanceof SVGElement && 'getBBox' in target; };
var isHidden = function (target) {
    if (isSVG(target)) {
        var _a = target.getBBox(), width = _a.width, height = _a.height;
        return !width && !height;
    }
    var _b = target, offsetWidth = _b.offsetWidth, offsetHeight = _b.offsetHeight;
    return !(offsetWidth || offsetHeight || target.getClientRects().length);
};
var isElement = function (obj) {
    var _a, _b;
    if (obj instanceof Element) {
        return true;
    }
    var scope = (_b = (_a = obj) === null || _a === void 0 ? void 0 : _a.ownerDocument) === null || _b === void 0 ? void 0 : _b.defaultView;
    return !!(scope && obj instanceof scope.Element);
};
var isReplacedElement = function (target) {
    switch (target.tagName) {
        case 'INPUT':
            if (target.type !== 'image') {
                break;
            }
        case 'VIDEO':
        case 'AUDIO':
        case 'EMBED':
        case 'OBJECT':
        case 'CANVAS':
        case 'IFRAME':
        case 'IMG':
            return true;
    }
    return false;
};

var global$1 = typeof window !== 'undefined' ? window : {};

var cache = new WeakMap();
var scrollRegexp = /auto|scroll/;
var verticalRegexp = /^tb|vertical/;
var IE = (/msie|trident/i).test(global$1.navigator && global$1.navigator.userAgent);
var parseDimension = function (pixel) { return parseFloat(pixel || '0'); };
var size = function (inlineSize, blockSize, switchSizes) {
    if (inlineSize === void 0) { inlineSize = 0; }
    if (blockSize === void 0) { blockSize = 0; }
    if (switchSizes === void 0) { switchSizes = false; }
    return new ResizeObserverSize((switchSizes ? blockSize : inlineSize) || 0, (switchSizes ? inlineSize : blockSize) || 0);
};
var zeroBoxes = freeze({
    devicePixelContentBoxSize: size(),
    borderBoxSize: size(),
    contentBoxSize: size(),
    contentRect: new DOMRectReadOnly(0, 0, 0, 0)
});
var calculateBoxSizes = function (target, forceRecalculation) {
    if (forceRecalculation === void 0) { forceRecalculation = false; }
    if (cache.has(target) && !forceRecalculation) {
        return cache.get(target);
    }
    if (isHidden(target)) {
        cache.set(target, zeroBoxes);
        return zeroBoxes;
    }
    var cs = getComputedStyle(target);
    var svg = isSVG(target) && target.ownerSVGElement && target.getBBox();
    var removePadding = !IE && cs.boxSizing === 'border-box';
    var switchSizes = verticalRegexp.test(cs.writingMode || '');
    var canScrollVertically = !svg && scrollRegexp.test(cs.overflowY || '');
    var canScrollHorizontally = !svg && scrollRegexp.test(cs.overflowX || '');
    var paddingTop = svg ? 0 : parseDimension(cs.paddingTop);
    var paddingRight = svg ? 0 : parseDimension(cs.paddingRight);
    var paddingBottom = svg ? 0 : parseDimension(cs.paddingBottom);
    var paddingLeft = svg ? 0 : parseDimension(cs.paddingLeft);
    var borderTop = svg ? 0 : parseDimension(cs.borderTopWidth);
    var borderRight = svg ? 0 : parseDimension(cs.borderRightWidth);
    var borderBottom = svg ? 0 : parseDimension(cs.borderBottomWidth);
    var borderLeft = svg ? 0 : parseDimension(cs.borderLeftWidth);
    var horizontalPadding = paddingLeft + paddingRight;
    var verticalPadding = paddingTop + paddingBottom;
    var horizontalBorderArea = borderLeft + borderRight;
    var verticalBorderArea = borderTop + borderBottom;
    var horizontalScrollbarThickness = !canScrollHorizontally ? 0 : target.offsetHeight - verticalBorderArea - target.clientHeight;
    var verticalScrollbarThickness = !canScrollVertically ? 0 : target.offsetWidth - horizontalBorderArea - target.clientWidth;
    var widthReduction = removePadding ? horizontalPadding + horizontalBorderArea : 0;
    var heightReduction = removePadding ? verticalPadding + verticalBorderArea : 0;
    var contentWidth = svg ? svg.width : parseDimension(cs.width) - widthReduction - verticalScrollbarThickness;
    var contentHeight = svg ? svg.height : parseDimension(cs.height) - heightReduction - horizontalScrollbarThickness;
    var borderBoxWidth = contentWidth + horizontalPadding + verticalScrollbarThickness + horizontalBorderArea;
    var borderBoxHeight = contentHeight + verticalPadding + horizontalScrollbarThickness + verticalBorderArea;
    var boxes = freeze({
        devicePixelContentBoxSize: size(Math.round(contentWidth * devicePixelRatio), Math.round(contentHeight * devicePixelRatio), switchSizes),
        borderBoxSize: size(borderBoxWidth, borderBoxHeight, switchSizes),
        contentBoxSize: size(contentWidth, contentHeight, switchSizes),
        contentRect: new DOMRectReadOnly(paddingLeft, paddingTop, contentWidth, contentHeight)
    });
    cache.set(target, boxes);
    return boxes;
};
var calculateBoxSize = function (target, observedBox, forceRecalculation) {
    var _a = calculateBoxSizes(target, forceRecalculation), borderBoxSize = _a.borderBoxSize, contentBoxSize = _a.contentBoxSize, devicePixelContentBoxSize = _a.devicePixelContentBoxSize;
    switch (observedBox) {
        case ResizeObserverBoxOptions.DEVICE_PIXEL_CONTENT_BOX:
            return devicePixelContentBoxSize;
        case ResizeObserverBoxOptions.BORDER_BOX:
            return borderBoxSize;
        default:
            return contentBoxSize;
    }
};

var ResizeObserverEntry = (function () {
    function ResizeObserverEntry(target) {
        var boxes = calculateBoxSizes(target);
        this.target = target;
        this.contentRect = boxes.contentRect;
        this.borderBoxSize = freeze([boxes.borderBoxSize]);
        this.contentBoxSize = freeze([boxes.contentBoxSize]);
        this.devicePixelContentBoxSize = freeze([boxes.devicePixelContentBoxSize]);
    }
    return ResizeObserverEntry;
}());

var calculateDepthForNode = function (node) {
    if (isHidden(node)) {
        return Infinity;
    }
    var depth = 0;
    var parent = node.parentNode;
    while (parent) {
        depth += 1;
        parent = parent.parentNode;
    }
    return depth;
};

var broadcastActiveObservations = function () {
    var shallowestDepth = Infinity;
    var callbacks = [];
    resizeObservers.forEach(function processObserver(ro) {
        if (ro.activeTargets.length === 0) {
            return;
        }
        var entries = [];
        ro.activeTargets.forEach(function processTarget(ot) {
            var entry = new ResizeObserverEntry(ot.target);
            var targetDepth = calculateDepthForNode(ot.target);
            entries.push(entry);
            ot.lastReportedSize = calculateBoxSize(ot.target, ot.observedBox);
            if (targetDepth < shallowestDepth) {
                shallowestDepth = targetDepth;
            }
        });
        callbacks.push(function resizeObserverCallback() {
            ro.callback.call(ro.observer, entries, ro.observer);
        });
        ro.activeTargets.splice(0, ro.activeTargets.length);
    });
    for (var _i = 0, callbacks_1 = callbacks; _i < callbacks_1.length; _i++) {
        var callback = callbacks_1[_i];
        callback();
    }
    return shallowestDepth;
};

var gatherActiveObservationsAtDepth = function (depth) {
    resizeObservers.forEach(function processObserver(ro) {
        ro.activeTargets.splice(0, ro.activeTargets.length);
        ro.skippedTargets.splice(0, ro.skippedTargets.length);
        ro.observationTargets.forEach(function processTarget(ot) {
            if (ot.isActive()) {
                if (calculateDepthForNode(ot.target) > depth) {
                    ro.activeTargets.push(ot);
                }
                else {
                    ro.skippedTargets.push(ot);
                }
            }
        });
    });
};

var process = function () {
    var depth = 0;
    gatherActiveObservationsAtDepth(depth);
    while (hasActiveObservations()) {
        depth = broadcastActiveObservations();
        gatherActiveObservationsAtDepth(depth);
    }
    if (hasSkippedObservations()) {
        deliverResizeLoopError();
    }
    return depth > 0;
};

var trigger;
var callbacks = [];
var notify = function () { return callbacks.splice(0).forEach(function (cb) { return cb(); }); };
var queueMicroTask = function (callback) {
    if (!trigger) {
        var toggle_1 = 0;
        var el_1 = document.createTextNode('');
        var config = { characterData: true };
        new MutationObserver(function () { return notify(); }).observe(el_1, config);
        trigger = function () { el_1.textContent = "" + (toggle_1 ? toggle_1-- : toggle_1++); };
    }
    callbacks.push(callback);
    trigger();
};

var queueResizeObserver = function (cb) {
    queueMicroTask(function ResizeObserver() {
        requestAnimationFrame(cb);
    });
};

var watching = 0;
var isWatching = function () { return !!watching; };
var CATCH_PERIOD = 250;
var observerConfig = { attributes: true, characterData: true, childList: true, subtree: true };
var events$1 = [
    'resize',
    'load',
    'transitionend',
    'animationend',
    'animationstart',
    'animationiteration',
    'keyup',
    'keydown',
    'mouseup',
    'mousedown',
    'mouseover',
    'mouseout',
    'blur',
    'focus'
];
var time = function (timeout) {
    if (timeout === void 0) { timeout = 0; }
    return Date.now() + timeout;
};
var scheduled = false;
var Scheduler = (function () {
    function Scheduler() {
        var _this = this;
        this.stopped = true;
        this.listener = function () { return _this.schedule(); };
    }
    Scheduler.prototype.run = function (timeout) {
        var _this = this;
        if (timeout === void 0) { timeout = CATCH_PERIOD; }
        if (scheduled) {
            return;
        }
        scheduled = true;
        var until = time(timeout);
        queueResizeObserver(function () {
            var elementsHaveResized = false;
            try {
                elementsHaveResized = process();
            }
            finally {
                scheduled = false;
                timeout = until - time();
                if (!isWatching()) {
                    return;
                }
                if (elementsHaveResized) {
                    _this.run(1000);
                }
                else if (timeout > 0) {
                    _this.run(timeout);
                }
                else {
                    _this.start();
                }
            }
        });
    };
    Scheduler.prototype.schedule = function () {
        this.stop();
        this.run();
    };
    Scheduler.prototype.observe = function () {
        var _this = this;
        var cb = function () { return _this.observer && _this.observer.observe(document.body, observerConfig); };
        document.body ? cb() : global$1.addEventListener('DOMContentLoaded', cb);
    };
    Scheduler.prototype.start = function () {
        var _this = this;
        if (this.stopped) {
            this.stopped = false;
            this.observer = new MutationObserver(this.listener);
            this.observe();
            events$1.forEach(function (name) { return global$1.addEventListener(name, _this.listener, true); });
        }
    };
    Scheduler.prototype.stop = function () {
        var _this = this;
        if (!this.stopped) {
            this.observer && this.observer.disconnect();
            events$1.forEach(function (name) { return global$1.removeEventListener(name, _this.listener, true); });
            this.stopped = true;
        }
    };
    return Scheduler;
}());
var scheduler = new Scheduler();
var updateCount = function (n) {
    !watching && n > 0 && scheduler.start();
    watching += n;
    !watching && scheduler.stop();
};

var skipNotifyOnElement = function (target) {
    return !isSVG(target)
        && !isReplacedElement(target)
        && getComputedStyle(target).display === 'inline';
};
var ResizeObservation = (function () {
    function ResizeObservation(target, observedBox) {
        this.target = target;
        this.observedBox = observedBox || ResizeObserverBoxOptions.CONTENT_BOX;
        this.lastReportedSize = {
            inlineSize: 0,
            blockSize: 0
        };
    }
    ResizeObservation.prototype.isActive = function () {
        var size = calculateBoxSize(this.target, this.observedBox, true);
        if (skipNotifyOnElement(this.target)) {
            this.lastReportedSize = size;
        }
        if (this.lastReportedSize.inlineSize !== size.inlineSize
            || this.lastReportedSize.blockSize !== size.blockSize) {
            return true;
        }
        return false;
    };
    return ResizeObservation;
}());

var ResizeObserverDetail = (function () {
    function ResizeObserverDetail(resizeObserver, callback) {
        this.activeTargets = [];
        this.skippedTargets = [];
        this.observationTargets = [];
        this.observer = resizeObserver;
        this.callback = callback;
    }
    return ResizeObserverDetail;
}());

var observerMap = new WeakMap();
var getObservationIndex = function (observationTargets, target) {
    for (var i = 0; i < observationTargets.length; i += 1) {
        if (observationTargets[i].target === target) {
            return i;
        }
    }
    return -1;
};
var ResizeObserverController = (function () {
    function ResizeObserverController() {
    }
    ResizeObserverController.connect = function (resizeObserver, callback) {
        var detail = new ResizeObserverDetail(resizeObserver, callback);
        observerMap.set(resizeObserver, detail);
    };
    ResizeObserverController.observe = function (resizeObserver, target, options) {
        var detail = observerMap.get(resizeObserver);
        var firstObservation = detail.observationTargets.length === 0;
        if (getObservationIndex(detail.observationTargets, target) < 0) {
            firstObservation && resizeObservers.push(detail);
            detail.observationTargets.push(new ResizeObservation(target, options && options.box));
            updateCount(1);
            scheduler.schedule();
        }
    };
    ResizeObserverController.unobserve = function (resizeObserver, target) {
        var detail = observerMap.get(resizeObserver);
        var index = getObservationIndex(detail.observationTargets, target);
        var lastObservation = detail.observationTargets.length === 1;
        if (index >= 0) {
            lastObservation && resizeObservers.splice(resizeObservers.indexOf(detail), 1);
            detail.observationTargets.splice(index, 1);
            updateCount(-1);
        }
    };
    ResizeObserverController.disconnect = function (resizeObserver) {
        var _this = this;
        var detail = observerMap.get(resizeObserver);
        detail.observationTargets.slice().forEach(function (ot) { return _this.unobserve(resizeObserver, ot.target); });
        detail.activeTargets.splice(0, detail.activeTargets.length);
    };
    return ResizeObserverController;
}());

var ResizeObserver = (function () {
    function ResizeObserver(callback) {
        if (arguments.length === 0) {
            throw new TypeError("Failed to construct 'ResizeObserver': 1 argument required, but only 0 present.");
        }
        if (typeof callback !== 'function') {
            throw new TypeError("Failed to construct 'ResizeObserver': The callback provided as parameter 1 is not a function.");
        }
        ResizeObserverController.connect(this, callback);
    }
    ResizeObserver.prototype.observe = function (target, options) {
        if (arguments.length === 0) {
            throw new TypeError("Failed to execute 'observe' on 'ResizeObserver': 1 argument required, but only 0 present.");
        }
        if (!isElement(target)) {
            throw new TypeError("Failed to execute 'observe' on 'ResizeObserver': parameter 1 is not of type 'Element");
        }
        ResizeObserverController.observe(this, target, options);
    };
    ResizeObserver.prototype.unobserve = function (target) {
        if (arguments.length === 0) {
            throw new TypeError("Failed to execute 'unobserve' on 'ResizeObserver': 1 argument required, but only 0 present.");
        }
        if (!isElement(target)) {
            throw new TypeError("Failed to execute 'unobserve' on 'ResizeObserver': parameter 1 is not of type 'Element");
        }
        ResizeObserverController.unobserve(this, target);
    };
    ResizeObserver.prototype.disconnect = function () {
        ResizeObserverController.disconnect(this);
    };
    ResizeObserver.toString = function () {
        return 'function ResizeObserver () { [polyfill code] }';
    };
    return ResizeObserver;
}());

var dayjs_min = createCommonjsModule(function (module, exports) {
!function(t,e){module.exports=e();}(commonjsGlobal,(function(){var t=1e3,e=6e4,n=36e5,r="millisecond",i="second",s="minute",u="hour",a="day",o="week",f="month",h="quarter",c="year",d="date",$="Invalid Date",l=/^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[^0-9]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/,y=/\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,M={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_")},m=function(t,e,n){var r=String(t);return !r||r.length>=e?t:""+Array(e+1-r.length).join(n)+t},g={s:m,z:function(t){var e=-t.utcOffset(),n=Math.abs(e),r=Math.floor(n/60),i=n%60;return (e<=0?"+":"-")+m(r,2,"0")+":"+m(i,2,"0")},m:function t(e,n){if(e.date()<n.date())return -t(n,e);var r=12*(n.year()-e.year())+(n.month()-e.month()),i=e.clone().add(r,f),s=n-i<0,u=e.clone().add(r+(s?-1:1),f);return +(-(r+(n-i)/(s?i-u:u-i))||0)},a:function(t){return t<0?Math.ceil(t)||0:Math.floor(t)},p:function(t){return {M:f,y:c,w:o,d:a,D:d,h:u,m:s,s:i,ms:r,Q:h}[t]||String(t||"").toLowerCase().replace(/s$/,"")},u:function(t){return void 0===t}},D="en",v={};v[D]=M;var p=function(t){return t instanceof _},S=function(t,e,n){var r;if(!t)return D;if("string"==typeof t)v[t]&&(r=t),e&&(v[t]=e,r=t);else {var i=t.name;v[i]=t,r=i;}return !n&&r&&(D=r),r||!n&&D},w=function(t,e){if(p(t))return t.clone();var n="object"==typeof e?e:{};return n.date=t,n.args=arguments,new _(n)},O=g;O.l=S,O.i=p,O.w=function(t,e){return w(t,{locale:e.$L,utc:e.$u,x:e.$x,$offset:e.$offset})};var _=function(){function M(t){this.$L=S(t.locale,null,!0),this.parse(t);}var m=M.prototype;return m.parse=function(t){this.$d=function(t){var e=t.date,n=t.utc;if(null===e)return new Date(NaN);if(O.u(e))return new Date;if(e instanceof Date)return new Date(e);if("string"==typeof e&&!/Z$/i.test(e)){var r=e.match(l);if(r){var i=r[2]-1||0,s=(r[7]||"0").substring(0,3);return n?new Date(Date.UTC(r[1],i,r[3]||1,r[4]||0,r[5]||0,r[6]||0,s)):new Date(r[1],i,r[3]||1,r[4]||0,r[5]||0,r[6]||0,s)}}return new Date(e)}(t),this.$x=t.x||{},this.init();},m.init=function(){var t=this.$d;this.$y=t.getFullYear(),this.$M=t.getMonth(),this.$D=t.getDate(),this.$W=t.getDay(),this.$H=t.getHours(),this.$m=t.getMinutes(),this.$s=t.getSeconds(),this.$ms=t.getMilliseconds();},m.$utils=function(){return O},m.isValid=function(){return !(this.$d.toString()===$)},m.isSame=function(t,e){var n=w(t);return this.startOf(e)<=n&&n<=this.endOf(e)},m.isAfter=function(t,e){return w(t)<this.startOf(e)},m.isBefore=function(t,e){return this.endOf(e)<w(t)},m.$g=function(t,e,n){return O.u(t)?this[e]:this.set(n,t)},m.unix=function(){return Math.floor(this.valueOf()/1e3)},m.valueOf=function(){return this.$d.getTime()},m.startOf=function(t,e){var n=this,r=!!O.u(e)||e,h=O.p(t),$=function(t,e){var i=O.w(n.$u?Date.UTC(n.$y,e,t):new Date(n.$y,e,t),n);return r?i:i.endOf(a)},l=function(t,e){return O.w(n.toDate()[t].apply(n.toDate("s"),(r?[0,0,0,0]:[23,59,59,999]).slice(e)),n)},y=this.$W,M=this.$M,m=this.$D,g="set"+(this.$u?"UTC":"");switch(h){case c:return r?$(1,0):$(31,11);case f:return r?$(1,M):$(0,M+1);case o:var D=this.$locale().weekStart||0,v=(y<D?y+7:y)-D;return $(r?m-v:m+(6-v),M);case a:case d:return l(g+"Hours",0);case u:return l(g+"Minutes",1);case s:return l(g+"Seconds",2);case i:return l(g+"Milliseconds",3);default:return this.clone()}},m.endOf=function(t){return this.startOf(t,!1)},m.$set=function(t,e){var n,o=O.p(t),h="set"+(this.$u?"UTC":""),$=(n={},n[a]=h+"Date",n[d]=h+"Date",n[f]=h+"Month",n[c]=h+"FullYear",n[u]=h+"Hours",n[s]=h+"Minutes",n[i]=h+"Seconds",n[r]=h+"Milliseconds",n)[o],l=o===a?this.$D+(e-this.$W):e;if(o===f||o===c){var y=this.clone().set(d,1);y.$d[$](l),y.init(),this.$d=y.set(d,Math.min(this.$D,y.daysInMonth())).$d;}else $&&this.$d[$](l);return this.init(),this},m.set=function(t,e){return this.clone().$set(t,e)},m.get=function(t){return this[O.p(t)]()},m.add=function(r,h){var d,$=this;r=Number(r);var l=O.p(h),y=function(t){var e=w($);return O.w(e.date(e.date()+Math.round(t*r)),$)};if(l===f)return this.set(f,this.$M+r);if(l===c)return this.set(c,this.$y+r);if(l===a)return y(1);if(l===o)return y(7);var M=(d={},d[s]=e,d[u]=n,d[i]=t,d)[l]||1,m=this.$d.getTime()+r*M;return O.w(m,this)},m.subtract=function(t,e){return this.add(-1*t,e)},m.format=function(t){var e=this;if(!this.isValid())return $;var n=t||"YYYY-MM-DDTHH:mm:ssZ",r=O.z(this),i=this.$locale(),s=this.$H,u=this.$m,a=this.$M,o=i.weekdays,f=i.months,h=function(t,r,i,s){return t&&(t[r]||t(e,n))||i[r].substr(0,s)},c=function(t){return O.s(s%12||12,t,"0")},d=i.meridiem||function(t,e,n){var r=t<12?"AM":"PM";return n?r.toLowerCase():r},l={YY:String(this.$y).slice(-2),YYYY:this.$y,M:a+1,MM:O.s(a+1,2,"0"),MMM:h(i.monthsShort,a,f,3),MMMM:h(f,a),D:this.$D,DD:O.s(this.$D,2,"0"),d:String(this.$W),dd:h(i.weekdaysMin,this.$W,o,2),ddd:h(i.weekdaysShort,this.$W,o,3),dddd:o[this.$W],H:String(s),HH:O.s(s,2,"0"),h:c(1),hh:c(2),a:d(s,u,!0),A:d(s,u,!1),m:String(u),mm:O.s(u,2,"0"),s:String(this.$s),ss:O.s(this.$s,2,"0"),SSS:O.s(this.$ms,3,"0"),Z:r};return n.replace(y,(function(t,e){return e||l[t]||r.replace(":","")}))},m.utcOffset=function(){return 15*-Math.round(this.$d.getTimezoneOffset()/15)},m.diff=function(r,d,$){var l,y=O.p(d),M=w(r),m=(M.utcOffset()-this.utcOffset())*e,g=this-M,D=O.m(this,M);return D=(l={},l[c]=D/12,l[f]=D,l[h]=D/3,l[o]=(g-m)/6048e5,l[a]=(g-m)/864e5,l[u]=g/n,l[s]=g/e,l[i]=g/t,l)[y]||g,$?D:O.a(D)},m.daysInMonth=function(){return this.endOf(f).$D},m.$locale=function(){return v[this.$L]},m.locale=function(t,e){if(!t)return this.$L;var n=this.clone(),r=S(t,e,!0);return r&&(n.$L=r),n},m.clone=function(){return O.w(this.$d,this)},m.toDate=function(){return new Date(this.valueOf())},m.toJSON=function(){return this.isValid()?this.toISOString():null},m.toISOString=function(){return this.$d.toISOString()},m.toString=function(){return this.$d.toUTCString()},M}(),b=_.prototype;return w.prototype=b,[["$ms",r],["$s",i],["$m",s],["$H",u],["$W",a],["$M",f],["$y",c],["$D",d]].forEach((function(t){b[t[1]]=function(e){return this.$g(e,t[0],t[1])};})),w.extend=function(t,e){return t.$i||(t(e,_,w),t.$i=!0),w},w.locale=S,w.isDayjs=p,w.unix=function(t){return w(1e3*t)},w.en=v[D],w.Ls=v,w.p={},w}));
});

function numberEach(cb, from, to) {
  var iterate = from > to ? function () {
    return from--;
  } : function () {
    return from++;
  };
  var isEnd = from > to ? function () {
    return from < to;
  } : function () {
    return from > to;
  };
  var isStop = false;

  while (!isEnd() && !isStop) {
    isStop = cb(iterate()) === false;
  }
}
function getAlphaFromHex(hex) {
  return parseInt(hex.slice(7, 9), 16) / 255;
}
function getHexAlpha(alpha) {
  return Math.round(alpha * 255).toString(16);
}
function hexHasAlpha(hex) {
  return hex.length > 7;
}
function arrayRemoveItem(array, callback) {
  var itemIndex = array.findIndex(callback);

  if (itemIndex > -1) {
    return array.splice(itemIndex, 1)[0];
  }
}
function isSame(a, b) {
  var aType = typeof a;
  var bType = typeof b;

  if (aType !== bType) {
    return false;
  }

  var type = aType;

  if (['string', 'number', 'undefined'].includes(type) || a === null || b === null) {
    return a === b;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    return a.every(function (item, idx) {
      return isSame(item, b[idx]);
    });
  }

  if (type === 'object') {
    var aKeys = Object.keys(a);
    var bKeys = Object.keys(b);
    return aKeys.length === bKeys.length && aKeys.every(function (key) {
      return isSame(a[key], b[key]);
    });
  }

  return true;
}
function diff(a, b) {
  var aKeys = Object.keys(a);
  var bKeys = Object.keys(b);
  var changedKeys = [];
  new Set([].concat(aKeys, bKeys)).forEach(function (key) {
    if (!aKeys.includes(key) || !bKeys.includes(key) || !isSame(a[key], b[key])) {
      changedKeys.push({
        key: key,
        value: [a[key], b[key]]
      });
    }
  });
  return changedKeys;
}
function formatTimeRange(timeRange, formatStr) {
  return timeRange.map(function (t) {
    return t.format(formatStr);
  });
}
function getAbsoluteUrl(url) {
  var a = document.createElement('A');
  a.href = url;
  return a.href;
}

function dpr() {
  return window.devicePixelRatio || 1;
}

function npx(px) {
  return parseInt(px * dpr(), 10);
}

var Draw = /*#__PURE__*/function () {
  function Draw(el, width, height) {
    this.el = el;
    this.ctx = el.getContext('2d');
    this.resize(width, height);
    this.__cacheImgs = new Map();
  }

  var _proto = Draw.prototype;

  _proto._getImage = function _getImage(src) {
    var _this = this;

    src = getAbsoluteUrl(src);

    var img = this.__cacheImgs.get(src);

    if (img) {
      return Promise.resolve(img);
    }

    return new Promise(function (resolve) {
      img = new Image();

      img.onload = function () {
        _this.__cacheImgs.set(src, img);

        resolve(img);
      };

      img.src = src;
    });
  };

  _proto.resize = function resize(width, height) {
    this.el.style.width = width + "px";
    this.el.style.height = height + "px";
    this.el.width = npx(width);
    this.el.height = npx(height);
    this.ctx.scale(dpr(), dpr());
  };

  _proto.rect = function rect(config) {
    if (config === void 0) {
      config = {};
    }

    var ctx = this.ctx;
    var _config = config,
        x = _config.x,
        y = _config.y,
        width = _config.width,
        height = _config.height,
        borderColor = _config.borderColor,
        borderWidth = _config.borderWidth,
        borderTop = _config.borderTop,
        borderRight = _config.borderRight,
        borderBottom = _config.borderBottom;
    var _config2 = config,
        fill = _config2.fill;
    ctx.save();
    var alpha = getAlphaFromHex(fill);

    if (alpha < 1) {
      ctx.globalAlpha = alpha;
      fill = fill.slice(0, 7);
    }

    ctx.beginPath();
    ctx.fillStyle = fill;
    ctx.rect(x, y, width, height);
    ctx.clip();
    ctx.fill();
    ctx.restore();

    if (borderColor) {
      this.border(_extends_1({}, config, {
        x: config.x - borderWidth,
        y: config.y - borderWidth,
        borderWidth: borderWidth,
        borderColor: borderColor,
        borderTop: borderTop,
        borderRight: borderRight,
        borderBottom: borderBottom
      }));
    }
  };

  _proto.text = function text(config) {
    if (config === void 0) {
      config = {};
    }

    var _config3 = config,
        x = _config3.x,
        y = _config3.y,
        maxWidth = _config3.maxWidth,
        fill = _config3.fill,
        text = _config3.text,
        fontSize = _config3.fontSize,
        fontFamily = _config3.fontFamily;
    this.ctx.save();
    if (fontSize) this.ctx.fontSize = fontSize;
    if (fontFamily) this.ctx.fontFamily = fontFamily;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = fill;
    this.ctx.fillText(text, x, y, maxWidth);
    this.ctx.restore();
  };

  _proto.image = async function image(config) {
    if (config === void 0) {
      config = {};
    }

    console.log('draw image');
    var _config4 = config,
        x = _config4.x,
        y = _config4.y,
        width = _config4.width,
        height = _config4.height,
        src = _config4.src;
    var img = await this._getImage(src);
    this.ctx.drawImage(img, Math.floor(x), Math.floor(y), width, height);
  };

  _proto.border = function border(config) {
    if (config === void 0) {
      config = {};
    }

    var ctx = this.ctx;
    var _config5 = config,
        width = _config5.width,
        height = _config5.height,
        x = _config5.x,
        y = _config5.y,
        _config5$borderTop = _config5.borderTop,
        borderTop = _config5$borderTop === void 0 ? true : _config5$borderTop,
        _config5$borderRight = _config5.borderRight,
        borderRight = _config5$borderRight === void 0 ? true : _config5$borderRight,
        _config5$borderBottom = _config5.borderBottom,
        borderBottom = _config5$borderBottom === void 0 ? true : _config5$borderBottom,
        fill = _config5.fill,
        borderWidth = _config5.borderWidth,
        borderColor = _config5.borderColor;
    ctx.save();
    ctx.lineWidth = borderWidth;

    var drawLine = function drawLine(border, from, to) {
      ctx.beginPath();
      ctx.strokeStyle = border ? borderColor : fill;
      ctx.moveTo.apply(ctx, from);
      ctx.lineTo.apply(ctx, to);
      ctx.stroke();

      if (border === 'dash') {
        ctx.setLineDash([5, 6]);
        drawLine(false, from, to);
        ctx.setLineDash([]);
      }
    };

    var right = x + borderWidth * 2 + width;
    var bottom = y + borderWidth * 2 + height;
    var halfBorderWidth = borderWidth / 2;
    drawLine(borderTop, [x, y + halfBorderWidth], [right, y + halfBorderWidth]);
    drawLine(borderRight, [right - halfBorderWidth, y], [right - halfBorderWidth, bottom]);
    drawLine(borderBottom, [right, bottom - halfBorderWidth], [x, bottom - halfBorderWidth]);
    drawLine(borderRight, [x + halfBorderWidth, bottom], [x + halfBorderWidth, y]);
    ctx.restore();
  };

  return Draw;
}();

var CONTEXTMENU_CLASS = 'schedule-contextmenu';
var CONTEXTMENU_ITEM_CLASS = 'schedule-contextmenu-item';

var ContextMenu = /*#__PURE__*/function () {
  function ContextMenu(container, items) {
    var _this = this;

    this.container = container;

    this.onSelect = function () {};

    var ul = document.createElement('ul');
    ul.className = CONTEXTMENU_CLASS;
    items.forEach(function (m) {
      var li = document.createElement('li');
      li.className = CONTEXTMENU_ITEM_CLASS;
      li.innerText = m.title;
      li.dataset.action = m.action;
      ul.appendChild(li);
    });
    this.menu = ul;
    this.hide = this.hide.bind(this);
    this.hide();
    window.addEventListener('click', this.hide);

    ul.onclick = function (event) {
      _this.hide();

      var action = event.target.dataset.action;

      if (action) {
        _this.onSelect(action, items.find(function (item) {
          return item.action === action;
        }));
      }
    };

    this.container.appendChild(this.menu);
  }

  var _proto = ContextMenu.prototype;

  _proto.onContextMenuItemSelect = function onContextMenuItemSelect(onSelect) {
    this.onSelect = onSelect;
  };

  _proto.isVisible = function isVisible() {
    return this.menu.style.visibility === 'visible';
  };

  _proto.show = function show(_ref) {
    var x = _ref.x,
        y = _ref.y;
    this.menu.style.visibility = 'visible';
    this.menu.style.transform = "translate3d(" + x + "px, " + y + "px, 0)";
  };

  _proto.hide = function hide() {
    this.menu.style.visibility = 'hidden';
  };

  return ContextMenu;
}();

var events = {
  CONTEXT_MENU_ITEM_SELECT: 'contextMenuItemSelect',
  SELECTE: 'select',
  DATA_CHANGE: 'dataChange',
  TIME_RANGE_CHANGE: 'timeRangeChange',
  RESIZE: 'resize'
};
var eventMixin = {
  /**
   * Subscribe to event, usage:
   *  schedule.on('select', (item) => { ... }
   */
  on: function on(eventName, handler) {
    if (!this._eventHandlers) this._eventHandlers = {};

    if (!this._eventHandlers[eventName]) {
      this._eventHandlers[eventName] = [];
    }

    this._eventHandlers[eventName].push(handler);
  },

  /**
   * Cancel the subscription, usage:
   *  schedule.off('select', handler)
   */
  off: function off(eventName, handler) {
    var handlers = this._eventHandlers[eventName];
    if (!handlers) return;

    for (var i = 0; i < handlers.length; i++) {
      if (handlers[i] === handler) {
        handlers.splice(i--, 1);
      }
    }
  },

  /**
   * Generate an event with the given name and data
   *  this.emit('select', ...)
   */
  emit: function emit(eventName) {
    var _this = this;

    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    if (!this._eventHandlers || !this._eventHandlers[eventName] || !this._eventHandlers[eventName].length) {
      return false; // no handlers for that event name
    } // call the handlers


    this._eventHandlers[eventName].forEach(function (handler) {
      return handler.apply(_this, args);
    });

    return true;
  }
};

/**
 * Table render and managing.
 * @class {Table}
 */

var Table = /*#__PURE__*/function () {
  function Table(schedule, items, _temp) {
    var _ref = _temp === void 0 ? {} : _temp,
        cells = _ref.cells,
        rowHeader = _ref.rowHeader,
        colHeader = _ref.colHeader,
        highlights = _ref.highlights,
        contextMenu = _ref.contextMenu,
        tooltip = _ref.tooltip;

    this.schedule = schedule;
    /**
     * The root node to which newly created table will be inserted
     * @type {HTMLElement}
     */

    this.canvas = schedule.canvas;
    /**
     * Cache the settings.
     * @type {Cells}
     */

    this.settings = schedule.settings;
    this.items = items;
    /**
     * Reference to the instance of cells renderer.
     * @type {Cells}
     */

    this.cells = cells;
    /**
     * Reference to the instance of row header renderer.
     * @type {RowHeader}
     */

    this.rowHeader = rowHeader;
    /**
     * Reference to the instance of col header renderer.
     * @type {ColHeader}
     */

    this.colHeader = colHeader;
    /**
     * Reference to the instance of highlights.
     * @type {Highlights}
     */

    this.highlights = highlights;
    /**
     * Reference to the instance of highlights.
     * @type {ContextMenu}
     */

    this.contextMenu = contextMenu;
    /**
     * Reference to the instance of tooltip.
     * @type {Tooltip}
     */

    this.tooltip = tooltip;
    this.currentSelection = null;
    this.selections = [];
    /**
     * Set table renderer.
     */

    this.cells.setTable(this);
    this.rowHeader.setTable(this);
    this.colHeader.setTable(this);
  }

  var _proto = Table.prototype;

  _proto.setItems = function setItems(items, oldItems) {
    var _this = this;

    var itemsToDelete = [].concat(oldItems);
    var itemsToRender = [];
    items.forEach(function (item) {
      var oldItem = arrayRemoveItem(itemsToDelete, function (i) {
        return i.colIdx === item.colIdx && i.rowIdx === item.rowIdx;
      });

      if (oldItem) {
        var changedKeys = diff(item.data, oldItem.data);

        if (changedKeys.length) {
          itemsToRender.push(item);
        }
      } else {
        itemsToRender.push(item);
      }
    });

    if (itemsToRender.length) {
      this.cells.render(itemsToRender);
    }

    itemsToDelete.forEach(function (item) {
      var cell = _this.getCell(item.colIdx, item.rowIdx);

      if (cell.hasData()) {
        if (_this.currentSelection) {
          _this.currentSelection.deleteCell(cell);
        } else {
          cell.delete();
        }
      }
    });
    this.items = items;
  }
  /**
   * Render the Table.
   * @param {number} tableWidth Width of Table.
   * @param {number} tableHeight Height of Table.
   */
  ;

  _proto.render = function render(tableWidth, tableHeight) {
    var _this2 = this;

    var _this$settings = this.settings,
        fontSize = _this$settings.fontSize,
        fontFamily = _this$settings.fontFamily,
        numberOfCols = _this$settings.numberOfCols,
        numberOfRows = _this$settings.numberOfRows,
        cellBorderWidth = _this$settings.cellBorderWidth,
        colHeaderWidth = _this$settings.colHeaderWidth,
        timeScale = _this$settings.timeScale; // calculate width of col.

    this.cellWidth = Math.floor((tableWidth - cellBorderWidth - colHeaderWidth) / numberOfCols); // calculate height of row.

    var totalNumberOfRows = numberOfRows + (this.rowHeader ? 1 : 0);
    this.cellHeight = Math.floor((tableHeight - cellBorderWidth) / totalNumberOfRows) * timeScale; // Set width of height of row header.

    this.settings.rowHeaderHeight = this.cellHeight / timeScale;
    tableWidth = this.cellWidth * numberOfCols + colHeaderWidth + cellBorderWidth;
    tableHeight = this.cellHeight / timeScale * totalNumberOfRows + cellBorderWidth;

    if (isSame(tableWidth, this.tableWidth) && isSame(tableHeight, this.tableHeight)) {
      return;
    }

    this.tableWidth = tableWidth;
    this.tableHeight = tableHeight;
    this.schedule.container.style.width = this.tableWidth + 'px';
    this.schedule.container.style.height = this.tableHeight + 'px'; // set a timeout for trigger after setting

    setTimeout(function () {
      _this2.schedule.emit(events.RESIZE, _this2.tableWidth, _this2.tableHeight);
    }, 0);

    if (!this.draw) {
      this.draw = new Draw(this.canvas, this.tableWidth, this.tableHeight);
    } else {
      this.draw.resize(this.tableWidth, this.tableHeight);
    }
    /**
     * Set global font config.
     */


    this.draw.ctx.font = fontSize + "px " + fontFamily;
    /**
     * Set instance of Draw.
     */

    this.cells.setRenderer(this.draw);
    this.rowHeader.setRenderer(this.draw);
    this.colHeader.setRenderer(this.draw);
    this.cells.render();
    this.rowHeader.render();
    this.colHeader.render();
    this.highlights.adjustAll();
  }
  /**
   *
   * @param {Function} cb
   * @param {Object} config
   */
  ;

  _proto.cellsEach = function cellsEach(cb, config) {
    this.cells.cellsEach(cb, config);
  }
  /**
   *
   * @param {Function} cb
   * @param {Object} config
   */
  ;

  _proto.cellGroupsEach = function cellGroupsEach(cb, config) {
    return this.cells.cellGroupsEach(cb, config);
  }
  /**
   * Get cell specified by index of column and index of row.
   * @param {number} colIdx Index of col.
   * @param {*} rowIdx  Index of row.
   * @param {boolean} crossCol Cross col when col index bigger than max col idx.
   */
  ;

  _proto.getCell = function getCell(colIdx, rowIdx, crossCol) {
    return this.cells.getCell(colIdx, rowIdx, crossCol);
  }
  /**
   * Return column index specified x coord.
   * @param {number} x
   */
  ;

  _proto.getColIdx = function getColIdx(x) {
    return Math.floor((x - this.cells.startingCoords.x) / this.cellWidth);
  }
  /**
   * Return row index specified y coord.
   * @param {number} y
   */
  ;

  _proto.getRowIdx = function getRowIdx(y) {
    return Math.floor((y - this.cells.startingCoords.y) / this.cellHeight);
  }
  /**
   * Return cell specified y coords.
   * @param {number} coords
   * @param {boolean} crossCol Cross col when col index bigger than max col idx.
   */
  ;

  _proto.getCellByCoord = function getCellByCoord(_ref2, crossCol) {
    var x = _ref2.x,
        y = _ref2.y;
    var colIdx = Math.floor((x - this.cells.startingCoords.x) / this.cellWidth);
    var rowIdx = Math.floor((y - this.cells.startingCoords.y) / this.cellHeight);
    return this.getCell(colIdx, rowIdx, crossCol);
  }
  /**
   *
   * @param {array} cells
   * @param {boolean} reverse
   */
  ;

  _proto.sort = function sort(cells, reverse) {
    var judge = function judge(a, b) {
      return reverse ? a > b : a < b;
    };

    return [].concat(cells).sort(function (a, b) {
      if (judge(a.colIdx, b.colIdx)) {
        return -1;
      } else if (a.colIdx === b.colIdx) {
        return judge(a.rowIdx, b.rowIdx) ? -1 : 1;
      }
    });
  }
  /**
   *
   * @param {Cell} cellFrom
   * @param {Cell} cellTo
   * @param {Function} filter
   */
  ;

  _proto.getCellsBetween = function getCellsBetween(cellFrom, cellTo, filter) {
    var _this$sort = this.sort([cellFrom, cellTo]),
        _cellFrom = _this$sort[0],
        _cellTo = _this$sort[1];

    var cellsBetween = [];
    this.cellsEach(function (cell) {
      if (filter && filter(cell)) {
        return false;
      }

      cellsBetween.push(cell);
    }, {
      cellFrom: _cellFrom,
      cellTo: _cellTo
    });
    return cellsBetween;
  }
  /**
   *
   * @param {Cell} cellFrom
   * @param {Cell} cellTo
   */
  ;

  _proto.getEmptyCellsBetween = function getEmptyCellsBetween(cellFrom, cellTo) {
    return this.getCellsBetween(cellFrom, cellTo, function (cell) {
      return cell.hasData() && !cell.isSame(_cellFrom);
    });
  }
  /**
   * Select multiple cells.
   * @param {Cell} oriCell
   * @param {number} colTo
   * @param {number} rowIdx
   * @returns {Array} Selected Cells.
   */
  ;

  _proto.selectMultiCols = function selectMultiCols(oriCell, colTo, rowIdx) {
    var colFrom = oriCell.colIdx;
    var selectedCells = [];

    var isEnd = function isEnd() {
      return colFrom <= colTo;
    };

    var iterate = function iterate() {
      return colFrom++;
    };

    if (colFrom > colTo) {
      isEnd = function isEnd() {
        return colFrom >= colTo;
      };

      iterate = function iterate() {
        return colFrom--;
      };
    }

    while (isEnd()) {
      var cellFrom = this.getCell(iterate(), oriCell.rowIdx);
      cellFrom.select();
      selectedCells.push(this.mergeCols(cellFrom, rowIdx));
    }

    return selectedCells;
  }
  /**
   *
   * @param {Cell} cellFrom
   * @param {number} rowIdx
   * @returns Actual cell after merged.
   */
  ;

  _proto.mergeCols = function mergeCols(cellFrom, rowIdx) {
    var cellTo = this.getCell(cellFrom.colIdx, rowIdx);
    var cellsToMerge = this.getEmptyCellsBetween(cellFrom, cellTo);
    return cellFrom.merge(cellsToMerge);
  }
  /**
   *
   * @param {object} coord
   */
  ;

  _proto.mouseInCell = function mouseInCell(coord) {
    if (!this.contextMenu.isVisible()) {
      this.cellsEach(function (cell) {
        return cell.mouseOut();
      });
      this.schedule.hideTooltip();
      var cell = this.getCellByCoord(coord, false);

      if (cell && (this.settings.readOnly ? cell.hasData(true) : true)) {
        cell = cell.getCell();
        cell.mouseIn();
        this.schedule.showTooltip(cell);
      }
    }
  }
  /**
   * Highlight specified cell.
   * @param {Cell} cell
   */
  ;

  _proto.highlightSelections = function highlightSelections(cell) {
    this.selections.forEach(function (selection) {
      return selection.highlight();
    });
  }
  /**
   * Remove all highlight of cell.
   */
  ;

  _proto.removeHighlights = function removeHighlights() {
    this.highlights.clear();
  };

  _proto.setSelection = function setSelection(selection) {
    this.currentSelection = selection;
  };

  _proto.addSelection = function addSelection(selection) {
    this.selections.push(selection);
  };

  _proto.clearSelection = function clearSelection() {
    this.selections.forEach(function (selection) {
      return selection.deselect();
    });
    this.selections = [];
    this.currentSelection = null;
  };

  _proto.getSelections = function getSelections() {
    return this.selections;
  };

  _proto.finishSelection = function finishSelection() {
    var currentSelection = this.currentSelection;
        this.selections;

    if (currentSelection) {
      var numberOfBatchedCells = 0;
      this.highlightSelections();
      currentSelection.finish();
      var selectedItems = [];
      this.selections.forEach(function (selection) {
        return selection.batchedCells.forEach(function (cell) {
          selectedItems.push({
            data: cell.data,
            timeRange: cell.timeRange.map(function (t) {
              return t.format('YYYY-MM-DD HH:mm:ss');
            })
          });
          numberOfBatchedCells++;
        });
      });
      numberOfBatchedCells > 1 ? this.schedule.container.classList.add('schedule-multi-select') : this.schedule.container.classList.remove('schedule-multi-select');
      this.schedule.emit(events.SELECTE, selectedItems);
      var currentCell = currentSelection.getCell();

      if (currentCell.data) {
        var timeRangeKey = this.settings.timeRangeKey;
        var timeRange = formatTimeRange(currentCell.timeRange, 'YYYY-MM-DD HH:mm:ss');
        var oriTimeRange = currentCell.data[timeRangeKey];

        if (oriTimeRange && !isSame(timeRange, oriTimeRange)) {
          currentCell.data[timeRangeKey] = timeRange;
          this.schedule.emit(events.TIME_RANGE_CHANGE, timeRange, oriTimeRange);
        }
      }
    }
  };

  _proto.showContextMenu = function showContextMenu(coord) {
    if (this.currentSelection) {
      var cell = this.currentSelection.getCell();

      if (cell.hasData(true)) {
        this.tooltip.hide();
        this.contextMenu.show(coord);
      }
    }
  };

  return Table;
}();

var setPrototypeOf = createCommonjsModule(function (module) {
function _setPrototypeOf(o, p) {
  module.exports = _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  module.exports["default"] = module.exports, module.exports.__esModule = true;
  return _setPrototypeOf(o, p);
}

module.exports = _setPrototypeOf;
module.exports["default"] = module.exports, module.exports.__esModule = true;
});

var inheritsLoose = createCommonjsModule(function (module) {
function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  setPrototypeOf(subClass, superClass);
}

module.exports = _inheritsLoose;
module.exports["default"] = module.exports, module.exports.__esModule = true;
});

var assertThisInitialized = createCommonjsModule(function (module) {
function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

module.exports = _assertThisInitialized;
module.exports["default"] = module.exports, module.exports.__esModule = true;
});

/**
 * @class {BaseRender}
 */
var BaseRender = /*#__PURE__*/function () {
  function BaseRender() {
    /**
     * Instance of Draw.
     * @type {null|Draw}
     */
    this.draw = null;
    /**
     * Instance of Table.
     * @type {null|Table}
     */

    this.table = null;
  }
  /**
   * Set the draw instance.
   * @param {Draw} draw Draw instance.
   */


  var _proto = BaseRender.prototype;

  _proto.setRenderer = function setRenderer(draw) {
    this.draw = draw;
  }
  /**
   * Set the table instance.
   * @param {Table} table Table instance.
   */
  ;

  _proto.setTable = function setTable(table) {
    this.table = table;
  };

  return BaseRender;
}();

/**
 * @class {Cell}
 */

var Cell = /*#__PURE__*/function (_BaseRender) {
  inheritsLoose(Cell, _BaseRender);

  function Cell(_ref) {
    var _this;

    var colIdx = _ref.colIdx,
        rowIdx = _ref.rowIdx,
        label = _ref.label,
        parent = _ref.parent,
        dashLine = _ref.dashLine;
    _this = _BaseRender.call(this) || this;
    _this.colIdx = colIdx;
    _this.rowIdx = rowIdx;
    _this.label = label;
    _this.parent = parent;
    _this.borderWidth = 1;
    _this.borderTop = 1;
    _this.borderRight = 1;
    _this.borderBottom = 1;
    _this.borderLeft = 1;
    _this.dashLine = dashLine;
    _this.mergedCells = [assertThisInitialized(_this)];

    _this.setTable(parent.table);

    _this.setRenderer(parent.draw);

    _this.table = parent.table;
    _this.timeRange = null;

    _this.setTimeRange();

    _this.init();
    /**
     * Width of cell.
     * @type {number}
     */


    _this.width = 0;
    /**
     * Height of cell.
     * @type {number}
     */

    _this.height = 0;
    return _this;
  }

  var _proto = Cell.prototype;

  _proto.init = function init() {
    this.selected = false;
    this.hovering = false;
    this.__actualCell = this;
    this.data = null;
  };

  _proto.getCell = function getCell() {
    return this.__actualCell;
  };

  _proto.getColor = function getColor() {
    var _this$table$settings = this.table.settings,
        cellSelectedColor = _this$table$settings.cellSelectedColor,
        bgColor = _this$table$settings.bgColor,
        cellActiveColor = _this$table$settings.cellActiveColor,
        cellCrossColAlpha = _this$table$settings.cellCrossColAlpha;
    var cellColor = this.selected || this.hovering ? cellSelectedColor : bgColor;

    if (this.data) {
      cellColor = this.getDataValue('color') || cellActiveColor;
    }

    if (this.isCrossCol()) {
      cellColor = this.getCell().getColor() + getHexAlpha(cellCrossColAlpha);
    } else if (this.getCell() !== this) {
      cellColor = null;
    }

    return cellColor;
  };

  _proto.isCrossCol = function isCrossCol(idx) {
    var _cell = this.getCell();

    return _cell !== this && this.rowIdx === 0 && (idx ? this.colIdx === _cell.colIdx + idx : this.colIdx !== _cell.colIdx);
  };

  _proto.getIcon = function getIcon() {
    return this.getDataValue('icon');
  };

  _proto.getTexts = function getTexts() {
    return this.getDataValue('texts');
  };

  _proto.setTimeRange = function setTimeRange() {
    var _this$table$settings2 = this.table.settings,
        timeScale = _this$table$settings2.timeScale,
        yearMonth = _this$table$settings2.yearMonth;
    var timeFrom = yearMonth.add(this.rowIdx * 60 * timeScale + this.colIdx * 24 * 60, 'minute');
    var timeTo = timeFrom.add(this.getRowSpan() * 60 * timeScale, 'minute');
    this.timeRange = [timeFrom, timeTo];
  };

  _proto.getCoords = function getCoords(isCenter) {
    var _this$parent = this.parent,
        cellWidth = _this$parent.cellWidth,
        cellHeight = _this$parent.cellHeight;
    var x = this.colIdx * cellWidth + this.parent.startingCoords.x + (isCenter ? this.width / 2 : 0);
    var y = this.rowIdx * cellHeight + this.parent.startingCoords.y + (isCenter ? this.height / 2 : 0);
    return {
      x: x,
      y: y
    };
  };

  _proto.getDataValue = function getDataValue(key, data) {
    if (data === void 0) {
      data = this.data;
    }

    var _this$table$settings3 = this.table.settings,
        renderCell = _this$table$settings3.renderCell,
        dataMaps = _this$table$settings3.dataMaps;
    var map;

    if (dataMaps) {
      map = dataMaps[key];
    }

    key = this.table.settings[key + "Key"];

    if (typeof renderCell === 'function') {
      var obj = renderCell(data);
      return obj ? obj[key] : null;
    }

    if (!data) {
      return null;
    }

    if (map) {
      var _obj = map.find(function (o) {
        return o.key === data[key];
      });

      return _obj ? _obj.value : null;
    }

    return data[key];
  };

  _proto.getHighlightConfigs = function getHighlightConfigs() {
    var cellWidth = this.parent.cellWidth;
    var cellHeight = this.getColHeight();
    var cellBorderWidth = this.table.settings.cellBorderWidth;
    var mergedCells = this.getMergedCells();
    var colIdx = null;
    var i = -1;
    var cellsGroup = [];
    mergedCells.forEach(function (cell) {
      if (colIdx === null || cell.colIdx !== colIdx) {
        cellsGroup.push([]);
        colIdx = cell.colIdx;
        i++;
      }

      cellsGroup[i].push(cell);
    });
    return cellsGroup.map(function (cells) {
      return {
        width: cellWidth - cellBorderWidth,
        height: cells.length * cellHeight - cellBorderWidth,
        coords: cells[0].getCoords()
      };
    });
  };

  _proto.getMergedCells = function getMergedCells() {
    return this.mergedCells;
  };

  _proto.renderRect = function renderRect(cellColor) {
    this.data;
        var rowIdx = this.rowIdx;
    var cellWidth = this.parent.cellWidth;
    var _this$table$settings4 = this.table.settings,
        cellBorderWidth = _this$table$settings4.cellBorderWidth;
        _this$table$settings4.cellSelectedColor;
        _this$table$settings4.cellActiveColor;
        var cellBorderColor = _this$table$settings4.cellBorderColor;
        _this$table$settings4.bgColor;
        _this$table$settings4.colorKey;
        _this$table$settings4.iconKey;
        _this$table$settings4.textsKey;
    this.width = cellWidth - cellBorderWidth;
    this.height = this.getColHeight({
      includesMerged: true
    }) - cellBorderWidth;
    this.draw.rect(_extends_1({}, this.getCoords(), {
      width: this.width,
      height: this.height,
      fill: cellColor,
      borderColor: cellBorderColor,
      borderWidth: cellBorderWidth
    }, this.dashLine && !this.hasData() ? {
      borderTop: rowIdx % (1 / 0.5) !== 0 ? 'dash' : true,
      borderBottom: rowIdx % (1 / 0.5) === 0 ? 'dash' : true
    } : {}));
  };

  _proto.render = function render() {
    if (this.hidden) {
      return;
    }

    var bgColor = this.table.settings.bgColor;
    var cellColor = this.getColor();

    if (!cellColor) {
      return;
    } // Fill background color if color has alpha.


    if (hexHasAlpha(cellColor)) {
      this.renderRect(bgColor);
    }

    this.renderRect(cellColor);
    var crossColHeight = this.getCrossColHeight(1);

    if (this.data && crossColHeight < this.height) {
      this.renderIconAndTexts(this.getIcon(), this.getTexts());
    }

    if (this.isCrossCol(1) && crossColHeight > this.height) {
      var actualCell = this.getCell();
      this.renderIconAndTexts(actualCell.getIcon(), actualCell.getTexts(), crossColHeight);
    }

    this.renderLabel(this.label);
  };

  _proto.renderLabel = function renderLabel(label) {
    if (typeof label !== 'string') {
      return;
    }

    var _this$getCoords = this.getCoords(true),
        x = _this$getCoords.x,
        y = _this$getCoords.y;

    this.draw.text({
      text: label,
      x: x,
      y: y,
      fill: this.table.settings.headerTextColor
    });
  };

  _proto.renderIconAndTexts = function renderIconAndTexts(icon, texts, crossColHeight) {
    var _this2 = this;

    var _this$getCoords2 = this.getCoords(true),
        x = _this$getCoords2.x,
        y = _this$getCoords2.y;

    var height = crossColHeight || this.height;
    y = crossColHeight ? this.parent.startingCoords.y + height / 2 : y;

    if (texts || icon) {
      var _this$table$settings5 = this.table.settings,
          fontSize = _this$table$settings5.fontSize,
          fontColor = _this$table$settings5.fontColor,
          lineHeight = _this$table$settings5.lineHeight,
          iconMaxWidth = _this$table$settings5.iconMaxWidth;
      var imgPadding = 5;
      var imgSize = Math.min(this.width - imgPadding, iconMaxWidth);
      var maxNumberOfLines = 0;

      if (height < imgSize + lineHeight) {
        if (texts || height < imgSize + imgPadding) {
          icon = null;
          maxNumberOfLines = 1;
        }
      } else if (texts) {
        maxNumberOfLines = Math.min(texts.length, Math.floor((height - (icon ? imgSize : 0)) / lineHeight));
      }

      texts = texts.slice(0, maxNumberOfLines);
      y -= (maxNumberOfLines - 1) / 2 * lineHeight;

      if (icon) {
        y -= imgSize;
        this.draw.image({
          src: icon,
          x: x - imgSize / 2,
          y: y,
          width: imgSize,
          height: imgSize
        });
        y += imgSize + imgPadding * 2;
      }

      if (texts) {
        var maxFontLength = this.width / parseInt(fontSize);
        texts.forEach(function (text) {
          _this2.draw.text({
            text: String(text).slice(0, maxFontLength),
            x: x,
            y: y,
            fill: fontColor
          });

          y += lineHeight;
        });
      }
    }
  };

  _proto.setData = function setData(callback) {
    if (this.selected && this.isVisible()) {
      var _this$renderIfPropsCh;

      if (!this.data) {
        var _this$data;

        var timeRangeKey = this.table.settings.timeRangeKey;
        this.data = (_this$data = {}, _this$data[timeRangeKey] = this.timeRange, _this$data);
      }

      var data = _extends_1({}, this.data, callback || {});

      if (typeof callback === 'function') {
        data = callback(cell.data || {});
      }

      var _this$table$settings6 = this.table.settings,
          colorKey = _this$table$settings6.colorKey,
          iconKey = _this$table$settings6.iconKey,
          textsKey = _this$table$settings6.textsKey;

      var oriData = _extends_1({}, this.data);

      this.data = data;
      this.renderIfPropsChanged((_this$renderIfPropsCh = {}, _this$renderIfPropsCh[colorKey] = this.getDataValue('color', data), _this$renderIfPropsCh[iconKey] = this.getDataValue('icon', data), _this$renderIfPropsCh[textsKey] = this.getDataValue('texts', data), _this$renderIfPropsCh), oriData);
      return true;
    }

    return false;
  };

  _proto.mouseIn = function mouseIn() {
    !this.hasData() && this.renderIfPropsChanged({
      hovering: true
    });
    return this;
  };

  _proto.mouseOut = function mouseOut() {
    !this.hasData() && this.renderIfPropsChanged({
      hovering: false
    });
    return this;
  };

  _proto.select = function select() {
    if (this.hasData()) {
      this.selected = true;
    } else {
      this.renderIfPropsChanged({
        selected: true
      });
    }

    return this;
  };

  _proto.deselect = function deselect() {
    if (this.hasData()) {
      this.selected = false;
    } else {
      this.mergedCells.forEach(function (cell) {
        return cell.clear();
      });
    }

    return this;
  };

  _proto.renderIfPropsChanged = function renderIfPropsChanged(props, data) {
    if (data === void 0) {
      data = this;
    }

    if (this.getCell() !== this && !this.isCrossCol()) {
      return this.getCell().renderIfPropsChanged(props);
    }

    var hasChaned = false;
    Object.keys(props).forEach(function (prop) {
      if (props[prop] !== data[prop]) {
        data[prop] = props[prop];
        hasChaned = true;
      }
    });

    if (hasChaned) {
      this.renderMerged();
    }

    return hasChaned;
  };

  _proto.renderMerged = function renderMerged() {
    this.render();
    this.mergedCells.forEach(function (cell) {
      return cell.isCrossCol() && cell.render();
    });
  };

  _proto.cloneFrom = function cloneFrom(cell) {
    this.selected = cell.selected;
    this.data = cell.data;
    return this;
  };

  _proto.merge = function merge(cellsToMerge) {
    var actualCell = cellsToMerge[0];

    if (actualCell !== this) {
      return;
    }

    var oriMergedCells = this.__actualCell.mergedCells;
    var cellsToRender = [];
    [].concat(oriMergedCells, cellsToMerge).filter(function (cell) {
      return cell !== actualCell;
    }).forEach(function (cell) {
      // delete cell if meet other selected cell withourt data
      if (cell.getCell() !== actualCell && !cell.hasData()) {
        cell.delete();
      }

      if (!cellsToRender.find(function (c) {
        return c.isSamePosition(cell);
      })) {
        cell.init();
        cell.unMerge();
        cellsToRender.push(cell);
      }

      if (cellsToMerge.includes(cell)) {
        cell.__actualCell = actualCell;
      }
    });
    actualCell.mergedCells = [].concat(cellsToMerge);
    actualCell.__actualCell = actualCell;
    cellsToRender.push(actualCell);
    cellsToRender.forEach(function (cell) {
      return cell.render();
    });
    actualCell.setTimeRange();
    return actualCell;
  };

  _proto.unMerge = function unMerge() {
    this.mergedCells = [this];
    this.setTimeRange();
    return this;
  };

  _proto.getColHeight = function getColHeight(_temp) {
    var _ref2 = _temp === void 0 ? {} : _temp,
        includesMerged = _ref2.includesMerged,
        includesColIdx = _ref2.includesColIdx;

    var cellHeight = this.parent.cellHeight;

    var _cell = this.isCrossCol() ? this.getCell() : this;

    var colIdx = includesColIdx || this.colIdx;
    return includesMerged || includesColIdx ? _cell.mergedCells.filter(function (cell) {
      return cell.colIdx === colIdx;
    }).length * cellHeight : cellHeight;
  };

  _proto.getCrossColHeight = function getCrossColHeight(idx) {
    var includesColIdx = this.getCell().mergedCells[0].colIdx + idx;
    return this.getColHeight({
      includesColIdx: includesColIdx
    });
  };

  _proto.getRowSpan = function getRowSpan(colIdx) {
    var mergedCells = this.mergedCells;

    if (typeof colIdx !== 'number') {
      return mergedCells.length;
    }

    colIdx += mergedCells[0].colIdx;
    return mergedCells.filter(function (cell) {
      return cell.colIdx === colIdx;
    }).length;
  };

  _proto.getRowIdxOfLastCell = function getRowIdxOfLastCell() {
    var mergedCells = this.getMergedCells();
    return mergedCells[mergedCells.length - 1].rowIdx;
  };

  _proto.clear = function clear() {
    this.mergedCells.forEach(function (cell) {
      cell.init();
      cell.render();
    });
    this.mergedCells[0].unMerge();
  };

  _proto.delete = function _delete() {
    this.deselect();
    this.clear();
  };

  _proto.isBefore = function isBefore(cell) {
    return this.colIdx === cell.colIdx ? this.rowIdx < cell.rowIdx : this.colIdx < cell.colIdx;
  };

  _proto.isSame = function isSame(cell) {
    return this.getCell() === cell.getCell();
  };

  _proto.isSamePosition = function isSamePosition(cell) {
    return this.colIdx === cell.colIdx && this.rowIdx === cell.rowIdx;
  };

  _proto.isVisible = function isVisible() {
    return this.__actualCell === this;
  };

  _proto.isSelected = function isSelected() {
    return this.getCell().selected;
  };

  _proto.hasData = function hasData(includesMerged) {
    return includesMerged ? !!this.getCell().data : !!this.data;
  };

  return Cell;
}(BaseRender);
Object.assign(Cell.prototype, eventMixin);

/**
 * Cells rederer.
 * @class {Table}
 */

var Cells = /*#__PURE__*/function (_BaseRender) {
  inheritsLoose(Cells, _BaseRender);

  function Cells() {
    var _this;

    _this = _BaseRender.call(this) || this;
    /**
     * Array containing a list of cell.
     *
     * @private
     * @type {Array}
     */

    _this._cells = [];
    /**
     * Reference to the starting coords of cell.
     */

    _this.startingCoords = {
      x: 0,
      y: 0
    };
    return _this;
  }

  var _proto = Cells.prototype;

  _proto.init = function init() {
    var _this$table$settings = this.table.settings,
        numberOfCols = _this$table$settings.numberOfCols,
        numberOfRows = _this$table$settings.numberOfRows,
        timeScale = _this$table$settings.timeScale;
    var _this$table = this.table;
        _this$table.cellWidth;
        _this$table.cellHeight;

    for (var colIdx = 0; colIdx < numberOfCols; colIdx++) {
      this._cells[colIdx] = [];

      for (var rowIdx = 0; rowIdx < numberOfRows / timeScale; rowIdx++) {
        var cell = new Cell({
          colIdx: colIdx,
          rowIdx: rowIdx,
          parent: this,
          dashLine: true
        });

        if (rowIdx === 0 && colIdx === 0) {
          cell.colSpan = 2;
        }

        this._cells[colIdx].push(cell);
      }
    }
  };

  _proto.refresh = function refresh() {
    this.cellGroupsEach(function (cell) {
      return !cell.selected && cell.clear();
    });
    this.render();
  };

  _proto.adjust = function adjust() {
    var _this$table$settings2 = this.table.settings,
        colHeaderWidth = _this$table$settings2.colHeaderWidth,
        rowHeaderHeight = _this$table$settings2.rowHeaderHeight,
        cellBorderWidth = _this$table$settings2.cellBorderWidth;
    var _this$table2 = this.table,
        cellWidth = _this$table2.cellWidth,
        cellHeight = _this$table2.cellHeight;
    this.startingCoords = {
      x: colHeaderWidth + cellBorderWidth,
      y: rowHeaderHeight + cellBorderWidth
    };
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
  };

  _proto.render = function render(items) {
    var _this2 = this;

    if (!this._cells.length) this.init();
    this.adjust();
    items = this.table.sort(items || this.table.items);
    var item = items.shift();
    var cellsToMerge;
    this.cellsEach(function (cell) {
      if (item && cell.colIdx === item.colIdx && cell.rowIdx === item.rowIdx) {
        cell.data = item.data;
        cellsToMerge = _this2.table.getCellsBetween(cell, _this2.getCell(cell.colIdx, cell.rowIdx + item.rowSpan));
        cell.merge(cellsToMerge);
        item = items.shift();
      } else {
        cell.render();
      }
    });
  };

  _proto.cellsEach = function cellsEach(cb, _temp) {
    var _ref = _temp === void 0 ? {} : _temp,
        cellFrom = _ref.cellFrom,
        cellTo = _ref.cellTo,
        rowSpan = _ref.rowSpan,
        reverse = _ref.reverse;

    var _cells = this._cells;
    var colIdx = 0;
    var rowIdx = 0;

    if (cellFrom) {
      colIdx = cellFrom.colIdx;
      rowIdx = cellFrom.rowIdx;
    } else if (reverse) {
      var settings = this.table.settings;
      colIdx = settings.numberOfCols.length - 1;
      rowIdx = settings.numberOfRows.length - 1;
    }

    var colCells = _cells[colIdx];
    var curRowSpan = 0;
    var stop = false;

    while (!stop && colCells) {
      var cell = colCells[rowIdx];

      if (cell) {
        if (cb(cell, colIdx, rowIdx) === false) {
          stop = true;
        }

        if (cellTo && cellTo === cell) colCells = null;
        reverse ? rowIdx-- : rowIdx++;
      } else {
        rowIdx = 0;
        colCells = _cells[reverse ? --colIdx : ++colIdx];
      }

      if (rowSpan && curRowSpan++ === rowSpan) colCells = null;
    }
  }
  /**
   *
   * @param {Function} cb
   * @param {Object} config
   */
  ;

  _proto.cellGroupsEach = function cellGroupsEach(cb, config) {
    return this.cellsEach(function (cell) {
      cell.isVisible() && cb(cell);
      return true;
    }, config);
  };

  _proto.getCells = function getCells() {
    return this._cells;
  }
  /**
   * Get cell specified by index of column and index of row.
   * @param {number} colIdx Index of col.
   * @param {number} rowIdx  Index of row.
   * @param {boolean} crossCol Cross col when col index bigger than max col idx.
   */
  ;

  _proto.getCell = function getCell(colIdx, rowIdx, crossCol) {
    if (crossCol === void 0) {
      crossCol = true;
    }

    try {
      if (crossCol) {
        var numberOfRows = this.table.settings.numberOfRows / this.table.settings.timeScale;

        if (rowIdx > numberOfRows - 1 || rowIdx < 0) {
          var _numberOfRows = colIdx * numberOfRows + rowIdx;

          colIdx = Math.floor(_numberOfRows / numberOfRows);
          rowIdx = _numberOfRows % numberOfRows;
        }
      }

      return this.getCells()[colIdx][rowIdx] || null;
    } catch (error) {
      return null;
    }
  };

  return Cells;
}(BaseRender);

/**
 * Table render and managing.
 * @class {RowHeader}
 */

var RowHeader = /*#__PURE__*/function (_BaseRender) {
  inheritsLoose(RowHeader, _BaseRender);

  function RowHeader() {
    var _this;

    _this = _BaseRender.call(this) || this;
    _this._cells = [];
    /**
     * Reference to the starting coords of cell.
     */

    _this.startingCoords = {
      x: 0,
      y: 0
    };
    return _this;
  }

  var _proto = RowHeader.prototype;

  _proto.init = function init() {
    for (var colIdx = 0; colIdx < this.table.settings.numberOfCols; colIdx++) {
      this._cells[colIdx] = [];
      var cell = new Cell({
        colIdx: colIdx,
        rowIdx: 0,
        label: String(colIdx + 1),
        parent: this
      });
      cell.setRenderer(this.draw);
      cell.setTable(this.table);
      this._cells[colIdx] = cell;
    }
  };

  _proto.adjust = function adjust() {
    var _this$table = this.table,
        cellWidth = _this$table.cellWidth;
        _this$table.cellHeight;
    var _this$table$settings = this.table.settings,
        colHeaderWidth = _this$table$settings.colHeaderWidth,
        cellBorderWidth = _this$table$settings.cellBorderWidth,
        rowHeaderHeight = _this$table$settings.rowHeaderHeight;
    this.cellWidth = cellWidth;
    this.cellHeight = rowHeaderHeight;
    this.startingCoords = {
      x: colHeaderWidth + cellBorderWidth,
      y: cellBorderWidth
    };
  };

  _proto.render = function render() {
    if (!this._cells.length) this.init();
    this.adjust();

    this._cells.forEach(function (cell) {
      return cell.render();
    });
  };

  return RowHeader;
}(BaseRender);

/**
 * Table render and managing.
 * @class {rederer}
 */

var ColHeader = /*#__PURE__*/function (_BaseRender) {
  inheritsLoose(ColHeader, _BaseRender);

  function ColHeader() {
    var _this;

    _this = _BaseRender.call(this) || this;
    _this._cells = [];
    /**
     * Reference to the starting coords of cell.
     */

    _this.startingCoords = {
      x: 0,
      y: 0
    };
    return _this;
  }

  var _proto = ColHeader.prototype;

  _proto.init = function init() {
    for (var rowIdx = 0; rowIdx < this.table.settings.numberOfRows + 1; rowIdx++) {
      this._cells[rowIdx] = [];
      var cell = new Cell({
        colIdx: 0,
        rowIdx: rowIdx,
        label: rowIdx === 0 ? '' : rowIdx - 1 + "-" + rowIdx,
        parent: this
      });
      cell.setRenderer(this.draw);
      cell.setTable(this.table);
      this._cells[rowIdx] = cell;
    }
  };

  _proto.renderCornerLeft = function renderCornerLeft() {
    this.draw.text({
      text: '时',
      x: this.cellWidth * 0.3,
      y: this.cellHeight * 0.75
    });
    this.draw.text({
      text: '日',
      x: this.cellWidth * 0.75,
      y: this.cellHeight * 0.4
    });
    var _this$table$settings = this.table.settings,
        cellBorderColor = _this$table$settings.cellBorderColor,
        cellBorderWidth = _this$table$settings.cellBorderWidth;
    this.draw.ctx.save();
    this.draw.ctx.strokeStyle = cellBorderColor;
    this.draw.ctx.lineWidth = cellBorderWidth;
    this.draw.ctx.beginPath();
    this.draw.ctx.moveTo(0, 0);
    this.draw.ctx.lineTo(this.cellWidth, this.cellHeight);
    this.draw.ctx.stroke();
    this.draw.ctx.restore();
  };

  _proto.adjust = function adjust() {
    var _this$table = this.table,
        cellHeight = _this$table.cellHeight,
        settings = _this$table.settings;
    var cellBorderWidth = settings.cellBorderWidth,
        colHeaderWidth = settings.colHeaderWidth,
        timeScale = settings.timeScale;
    this.startingCoords = {
      x: cellBorderWidth,
      y: cellBorderWidth
    };
    this.cellWidth = colHeaderWidth;
    this.cellHeight = cellHeight / timeScale;
  };

  _proto.render = function render() {
    if (!this._cells.length) this.init();
    this.adjust();

    this._cells.forEach(function (cell) {
      return cell.render();
    });

    this.renderCornerLeft();
  };

  return ColHeader;
}(BaseRender);

var HIGHLIGHT_CLASS = 'schedule-highlight';
var HIGHLIGHT_UP_RESIZE_CLASS = 'schedule-highlight-up-resize';
var HIGHLIGHT_DOWN_RESIZE_CLASS = 'schedule-highlight-down-resize';
var HIGHLIGHT_DISABLED_UP_RESIZE = 'disabled-up-resize';
var HIGHLIGHT_DISABLED_DOWN_RESIZE = 'disabled-down-resize';
/**
 * @class {Highlights}
 */

var Highlights = /*#__PURE__*/function () {
  function Highlights(rootNode, onResize) {
    /**
     * @type {HTMLElement}
     */
    this.rootNode = rootNode;
    /**
     * @type {Function}
     */

    this.onResize = onResize;
    /**
     * Cache for highlight element.
     * @type {Array}
     */

    this._highlightList = [];
  }

  var _proto = Highlights.prototype;

  _proto.clearHighlights = function clearHighlights(highlightGroup) {
    highlightGroup._members.forEach(function (highlight) {
      highlight.style.visibility = 'hidden';
    });

    highlightGroup.cell = null;
  }
  /**
   * @returns {HTMLElement}
   */
  ;

  _proto.createNew = function createNew() {
    var highlightGroup = {
      _members: [],
      cell: null
    };

    this._highlightList.push(highlightGroup);

    return highlightGroup;
  };

  _proto.createHighlight = function createHighlight(highlightGroup) {
    var highlight = document.createElement('div');
    highlight.className = HIGHLIGHT_CLASS;
    highlight.upResize = document.createElement('div');
    highlight.upResize.className = HIGHLIGHT_UP_RESIZE_CLASS;
    highlight.downResize = document.createElement('div');
    highlight.downResize.className = HIGHLIGHT_DOWN_RESIZE_CLASS;
    highlight.appendChild(highlight.upResize);
    highlight.appendChild(highlight.downResize);
    this.rootNode.appendChild(highlight);

    highlightGroup._members.push(highlight);

    return highlight;
  };

  _proto.getCoords = function getCoords(event) {
    var _this$rootNode$getBou = this.rootNode.getBoundingClientRect(),
        left = _this$rootNode$getBou.left,
        top = _this$rootNode$getBou.top;

    return {
      x: event.clientX - left,
      y: event.clientY - top
    };
  };

  _proto.adjust = function adjust(highlightGroup) {
    var _this = this;

    var cell = highlightGroup.cell;
    var configs = cell.getHighlightConfigs();
    var nuhmberOfHighlights = configs.length;
    configs.forEach(function (config, idx) {
      var coords = config.coords,
          width = config.width,
          height = config.height;

      var highlight = highlightGroup._members[idx] || _this.createHighlight(highlightGroup);

      highlight.className = HIGHLIGHT_CLASS;
      highlight.style.transform = "translate3d(" + coords.x + "px, " + coords.y + "px, 0)";
      highlight.style.width = width + "px";
      highlight.style.height = height + "px";
      highlight.style.visibility = 'visible';
    });

    if (nuhmberOfHighlights > 1) {
      highlightGroup._members[0].classList.add(HIGHLIGHT_DISABLED_DOWN_RESIZE);

      highlightGroup._members[nuhmberOfHighlights - 1].classList.add(HIGHLIGHT_DISABLED_UP_RESIZE);

      highlightGroup._members.slice(1, nuhmberOfHighlights - 1).forEach(function (h) {
        return h.classList.add(HIGHLIGHT_DISABLED_DOWN_RESIZE, HIGHLIGHT_DISABLED_UP_RESIZE);
      });
    }
  };

  _proto.adjustAll = function adjustAll() {
    var _this2 = this;

    this._highlightList.forEach(function (highlightGroup) {
      if (highlightGroup.cell) {
        _this2.adjust(highlightGroup);
      }
    });
  }
  /**
   * Show the cell highlight.
   * @param {Cell} cell
   */
  ;

  _proto.show = function show(cell) {
    var highlightGroup = this._highlightList.find(function (h) {
      return !h.cell;
    });

    if (!highlightGroup) {
      highlightGroup = this.createNew();
    }

    highlightGroup.cell = cell;
    this.adjust(highlightGroup);
  };

  _proto.clear = function clear() {
    var _this3 = this;

    this._highlightList.forEach(function (highlightGroup) {
      return _this3.clearHighlights(highlightGroup);
    });
  };

  return Highlights;
}();

var Tooltip = /*#__PURE__*/function () {
  function Tooltip(container, color) {
    this._color = color;
    this.container = container;
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'schedule-tooltip';
    this.icon = document.createElement('img');
    this.icon.className = 'schedule-tooltip-icon';
    this.text = document.createElement('div');
    this.text.className = 'schedule-tooltip-text';
    this.tooltip.appendChild(this.text);
    this.tooltip.appendChild(this.icon);
    this._config = {
      color: color,
      text: null,
      icon: null
    };
    container.appendChild(this.tooltip);
  }
  /**
   *
   * @param {object} config
   * @param {number} config.x
   * @param {number} config.y
   * @param {string} config.color
   * @param {string} config.text
   */


  var _proto = Tooltip.prototype;

  _proto.show = function show(config) {
    this.tooltip.style.visibility = 'visible';
    this.refresh(config);
  }
  /**
   *
   * @param {object||Function} callback
   */
  ;

  _proto.refresh = function refresh(callback) {
    var _ref = typeof callback === 'function' ? callback(this._config) : callback,
        color = _ref.color,
        text = _ref.text,
        icon = _ref.icon,
        x = _ref.x,
        y = _ref.y,
        cellWidth = _ref.cellWidth;

    this.showIcon(icon);
    this.setBackgroundColor(color);
    this.setText(text);
    var edgePadding = 100;
    var distanceToCol = 3;
    var tooltipRect = this.tooltip.getBoundingClientRect();
    var containerRect = this.container.getBoundingClientRect();

    if (x + containerRect.x + tooltipRect.width + edgePadding > window.innerWidth) {
      x -= tooltipRect.width + cellWidth + distanceToCol;
    }

    if (y + containerRect.y + tooltipRect.height > window.innerHeight) {
      y = containerRect.height - tooltipRect.height;
    }

    x = Math.floor(x);
    y = Math.floor(y);
    this.tooltip.style.transform = "translate3d(" + (x + distanceToCol) + "px, " + y + "px, 0)";
  };

  _proto.setBackgroundColor = function setBackgroundColor(color) {
    this._config.color = color || this._color;
    this.tooltip.style.backgroundColor = this._config.color;
  };

  _proto.showIcon = function showIcon(icon) {
    this._config.icon = icon || null;
    this.icon.style.display = this._config.icon ? 'block' : 'none';

    if (this._config.icon) {
      this.icon.src = this._config.icon;
    }
  };

  _proto.setText = function setText(text) {
    this._config.text = text;
    this.text.innerHTML = this._config.text;
  };

  _proto.hide = function hide() {
    this.tooltip.style.visibility = 'hidden';
  };

  return Tooltip;
}();

/**
 * Manage cell selection.
 * @class {Selction}
 */

var Section = /*#__PURE__*/function () {
  function Section(schedule, cell) {
    /**
     * @type {Cell}
     */
    this.cell = null;
    /**
     * @type {number}
     */

    this.rowFrom = null;
    /**
     * @type {number}
     */

    this.colFrom = null;
    /**
     * @type {number}
     */

    this.rowSpan = null;
    /**
     * @type {number}
     */

    this.rowIdxOfLastCell = null;
    this.schedule = schedule;
    this.table = schedule.table;
    this.inProgress = true;
    this.batchedCells = [];
    this.setCell(cell);
    /**
     * Position of adjust, up of down.
     * @type {string}
     */

    this.positionOfAdjustment = null;
  }

  var _proto = Section.prototype;

  _proto.select = function select(colIdx, rowIdx) {
    colIdx = Math.max(0, colIdx);
    this.selectMultiCol(this.positionOfAdjustment ? this.colFrom : colIdx, rowIdx);
  };

  _proto.selectMultiCol = function selectMultiCol(colIdx, rowIdx) {
    var _this = this;

    var _batchedCells = [].concat(this.batchedCells);

    this.batchedCells = [];
    var cellsToMergedList = [];
    var stopedCellConfig = {
      colIdx: colIdx,
      rowIdx: rowIdx
    };
    numberEach(function (idx) {
      var cellsToMerged = _this.adjust(idx, rowIdx);

      if (idx !== _this.colFrom && _this.colMeetData(cellsToMerged)) {
        stopedCellConfig.colIdx = idx;
        return false;
      }

      if (cellsToMerged.length) {
        cellsToMergedList.push(cellsToMerged);
        arrayRemoveItem(_batchedCells, function (cell) {
          return cellsToMerged.some(function (c) {
            return c.colIdx === cell.getCell().colIdx;
          });
        });
      }
    }, this.colFrom, colIdx);
    var maxNumberOfMerge = cellsToMergedList.reduce(function (prev, current) {
      return Math.min(prev, current.length);
    }, cellsToMergedList[0].length);
    cellsToMergedList.forEach(function (cellsToMerged) {
      var reverse = _this.rowFrom > rowIdx;
      cellsToMerged = reverse ? cellsToMerged.reverse().slice(0, maxNumberOfMerge).reverse() : cellsToMerged.slice(0, maxNumberOfMerge);

      var mergedCell = _this.mergeRow(cellsToMerged);

      _this.setCell(mergedCell);

      _this.batchedCells.push(mergedCell);

      stopedCellConfig.rowIdx = cellsToMerged[0].rowIdx;
    });

    _batchedCells.forEach(function (cell) {
      return cell.getCell().deselect();
    });

    this.schedule.showTooltip(this.table.getCell(stopedCellConfig.colIdx, stopedCellConfig.rowIdx));
  };

  _proto.move = function move(colIdx, rowIdx) {
    this.table.removeHighlights();
    var _this$table$settings = this.table.settings,
        numberOfRows = _this$table$settings.numberOfRows,
        timeScale = _this$table$settings.timeScale;
    this.selectMultiCol(this.colFrom, rowIdx + (colIdx - this.colFrom) * numberOfRows / timeScale);
  };

  _proto.cutCells = function cutCells(cells, length) {
    if (cells.length === 1) {
      return cells;
    }

    return cells[0].rowIdx > cells[1].rowIdx ? cells.reverse().slice(0, length).reverse() : cells.slice(0, length);
  };

  _proto.mergeRow = function mergeRow(cellToMerged) {
    var currentCell = this.cell.getCell();
    return cellToMerged[0].cloneFrom(currentCell).merge(cellToMerged);
  };

  _proto.colMeetData = function colMeetData(cells) {
    return !cells.length || cells.some(function (cell) {
      return cell.getCell().hasData();
    });
  };

  _proto.getEmptyCellsAtCol = function getEmptyCellsAtCol(colFrom, rowFrom, rowTo) {
    var _this2 = this;

    var emptyColCells = [];
    var currentCell = this.cell;
    numberEach(function (idx) {
      var cell = _this2.table.getCell(colFrom, idx);

      if (cell) {
        if (!currentCell.isSame(cell) && cell.getCell().hasData()) {
          return false;
        }

        emptyColCells.push(cell);
      }
    }, rowFrom, rowTo);
    return rowFrom > rowTo ? emptyColCells.reverse() : emptyColCells;
  };

  _proto.adjust = function adjust(colIdx, rowIdx) {
    if (!this.positionOfAdjustment && !this.cell.hasData()) {
      return this.getEmptyCellsAtCol(colIdx, this.rowFrom, rowIdx);
    } else if (this.positionOfAdjustment === 'down') {
      return this.getEmptyCellsAtCol(this.colFrom, this.rowFrom, Math.max(this.rowFrom, rowIdx - this.rowIdxOfLastCell + this.rowFrom + this.rowSpan - 1));
    } else if (this.positionOfAdjustment === 'up') {
      var rowTo = this.rowFrom + this.rowSpan - 1;
      return this.getEmptyCellsAtCol(this.colFrom, rowTo, Math.min(rowTo, rowIdx));
    }
  }
  /**
   *
   * @param {Cell} cell
   */
  ;

  _proto.setCell = function setCell(cell) {
    this.cell = cell.getCell().select();
  }
  /**
   * @returns {Cell} cell
   */
  ;

  _proto.getCell = function getCell() {
    return this.cell;
  }
  /**
   * Indicate that selection procell began.
   */
  ;

  _proto.begin = function begin(cell, positionOfAdjustment) {
    if (cell) {
      this.setCell(cell);
    }

    this.batchedCells = [this.cell];
    this.positionOfAdjustment = positionOfAdjustment || null;
    this.rowFrom = this.cell.rowIdx;
    this.colFrom = this.cell.colIdx;
    this.rowSpan = this.cell.getRowSpan();
    this.rowIdxOfLastCell = this.cell.getRowIdxOfLastCell();
    this.table.removeHighlights();
    this.inProgress = !this.cell.hasData(true) || positionOfAdjustment;
  }
  /**
   * Indicate that selection procell finished.
   */
  ;

  _proto.finish = function finish() {
    this.currentCell = null;
    this.inProgress = false;
    this.positionOfAdjustment = null;
  }
  /**
   * Check if the process of selecting the cell/cells is in progress.
   */
  ;

  _proto.isInProgress = function isInProgress() {
    return this.inProgress;
  }
  /**
   * Deselect all cells.
   * @param {boolean} includesDataSelection
   */
  ;

  _proto.deselect = function deselect(includesDataSelection) {
    this.table.removeHighlights();
    this.batchedCells.forEach(function (cell) {
      return cell.getCell().deselect();
    });
  };

  _proto.highlight = function highlight() {
    var _this3 = this;

    this.batchedCells = this.batchedCells.filter(function (cell) {
      if (cell.selected) {
        _this3.table.highlights.show(cell.getCell());

        return true;
      }

      return false;
    });
  };

  _proto.refresh = function refresh(cell) {
    this.deselect();
    this.setCell(cell);
    this.batchedCells = [this.cell];
    this.highlight();
  };

  _proto.deleteCell = function deleteCell(cell) {
    var selectedCell = this.getCell();
    var cellToDelete = cell || selectedCell;

    if (cellToDelete.isSame(selectedCell)) {
      this.deselect();
    }

    cellToDelete.delete();
  };

  return Section;
}();

createCommonjsModule(function (module, exports) {
// Source: http://jsfiddle.net/vWx8V/
// http://stackoverflow.com/questions/5603195/full-list-of-javascript-keycodes

/**
 * Conenience method returns corresponding value for given keyName or keyCode.
 *
 * @param {Mixed} keyCode {Number} or keyName {String}
 * @return {Mixed}
 * @api public
 */

function keyCode(searchInput) {
  // Keyboard Events
  if (searchInput && 'object' === typeof searchInput) {
    var hasKeyCode = searchInput.which || searchInput.keyCode || searchInput.charCode;
    if (hasKeyCode) searchInput = hasKeyCode;
  }

  // Numbers
  if ('number' === typeof searchInput) return names[searchInput]

  // Everything else (cast to string)
  var search = String(searchInput);

  // check codes
  var foundNamedKey = codes[search.toLowerCase()];
  if (foundNamedKey) return foundNamedKey

  // check aliases
  var foundNamedKey = aliases[search.toLowerCase()];
  if (foundNamedKey) return foundNamedKey

  // weird character?
  if (search.length === 1) return search.charCodeAt(0)

  return undefined
}

/**
 * Compares a keyboard event with a given keyCode or keyName.
 *
 * @param {Event} event Keyboard event that should be tested
 * @param {Mixed} keyCode {Number} or keyName {String}
 * @return {Boolean}
 * @api public
 */
keyCode.isEventKey = function isEventKey(event, nameOrCode) {
  if (event && 'object' === typeof event) {
    var keyCode = event.which || event.keyCode || event.charCode;
    if (keyCode === null || keyCode === undefined) { return false; }
    if (typeof nameOrCode === 'string') {
      // check codes
      var foundNamedKey = codes[nameOrCode.toLowerCase()];
      if (foundNamedKey) { return foundNamedKey === keyCode; }
    
      // check aliases
      var foundNamedKey = aliases[nameOrCode.toLowerCase()];
      if (foundNamedKey) { return foundNamedKey === keyCode; }
    } else if (typeof nameOrCode === 'number') {
      return nameOrCode === keyCode;
    }
    return false;
  }
};

exports = module.exports = keyCode;

/**
 * Get by name
 *
 *   exports.code['enter'] // => 13
 */

var codes = exports.code = exports.codes = {
  'backspace': 8,
  'tab': 9,
  'enter': 13,
  'shift': 16,
  'ctrl': 17,
  'alt': 18,
  'pause/break': 19,
  'caps lock': 20,
  'esc': 27,
  'space': 32,
  'page up': 33,
  'page down': 34,
  'end': 35,
  'home': 36,
  'left': 37,
  'up': 38,
  'right': 39,
  'down': 40,
  'insert': 45,
  'delete': 46,
  'command': 91,
  'left command': 91,
  'right command': 93,
  'numpad *': 106,
  'numpad +': 107,
  'numpad -': 109,
  'numpad .': 110,
  'numpad /': 111,
  'num lock': 144,
  'scroll lock': 145,
  'my computer': 182,
  'my calculator': 183,
  ';': 186,
  '=': 187,
  ',': 188,
  '-': 189,
  '.': 190,
  '/': 191,
  '`': 192,
  '[': 219,
  '\\': 220,
  ']': 221,
  "'": 222
};

// Helper aliases

var aliases = exports.aliases = {
  'windows': 91,
  '⇧': 16,
  '⌥': 18,
  '⌃': 17,
  '⌘': 91,
  'ctl': 17,
  'control': 17,
  'option': 18,
  'pause': 19,
  'break': 19,
  'caps': 20,
  'return': 13,
  'escape': 27,
  'spc': 32,
  'spacebar': 32,
  'pgup': 33,
  'pgdn': 34,
  'ins': 45,
  'del': 46,
  'cmd': 91
};

/*!
 * Programatically add the following
 */

// lower case chars
for (i = 97; i < 123; i++) codes[String.fromCharCode(i)] = i - 32;

// numbers
for (var i = 48; i < 58; i++) codes[i - 48] = i;

// function keys
for (i = 1; i < 13; i++) codes['f'+i] = i + 111;

// numpad keys
for (i = 0; i < 10; i++) codes['numpad '+i] = i + 96;

/**
 * Get by code
 *
 *   exports.name[13] // => 'Enter'
 */

var names = exports.names = exports.title = {}; // title for backward compat

// Create reverse mapping
for (i in codes) names[codes[i]] = i;

// Add aliases
for (var alias in aliases) {
  codes[alias] = aliases[alias];
}
});

/**
 * @class {Event}
 */

var Events = /*#__PURE__*/function () {
  function Events(schedule) {
    this.schedule = schedule;
    this.table = schedule.table;
    this.canvas = this.table.canvas;
    this.container = schedule.container;
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onContextMenu = this.onContextMenu.bind(this);
    this.onContextMenuItemSelect = this.onContextMenuItemSelect.bind(this);
    this.onKeydown = this.onKeydown.bind(this);
    var readOnly = this.table.settings.readOnly;

    if (!readOnly) {
      this.container.addEventListener('mousedown', this.onMouseDown);
      window.addEventListener('mouseup', this.onMouseUp);
      this.container.addEventListener('contextmenu', this.onContextMenu);
      document.addEventListener('keydown', this.onKeydown);
    }

    window.addEventListener('mousemove', this.onMouseMove);
    this.table.contextMenu.onContextMenuItemSelect(this.onContextMenuItemSelect);
  }

  var _proto = Events.prototype;

  _proto.addResizeListener = function addResizeListener(el, cb) {
    var ro = new ResizeObserver(function (entries, _) {
      var _entries$0$contentRec = entries[0].contentRect,
          width = _entries$0$contentRec.width,
          height = _entries$0$contentRec.height;
      cb(width, height);
    });
    ro.observe(el);
  }
  /**
   * @private
   */
  ;

  _proto.addEventListener = function addEventListener() {}
  /**
   *
   */
  ;

  _proto.onMouseDown = function onMouseDown(event) {
    event.preventDefault();

    if (event.target.classList.contains(CONTEXTMENU_ITEM_CLASS)) {
      return;
    }

    var coord = this.getCoords(event);
    var cell = this.table.getCellByCoord(coord);
    var currentSelection = this.table.currentSelection;

    if (event.target.classList.contains(HIGHLIGHT_DOWN_RESIZE_CLASS)) {
      return currentSelection.begin(null, 'down');
    }

    if (event.target.classList.contains(HIGHLIGHT_UP_RESIZE_CLASS)) {
      return currentSelection.begin(null, 'up');
    }

    if (event.shiftKey) {
      var colIdx = this.table.getColIdx(coord.x);
      var rowIdx = this.table.getRowIdx(coord.y);
      return currentSelection.move(colIdx, rowIdx);
    }

    if (!event.ctrlKey && !event.metaKey) {
      this.table.clearSelection();
    }

    if (cell && !cell.isSelected()) {
      var _currentSelection = new Section(this.schedule, cell);

      _currentSelection.begin(cell);

      this.table.setSelection(_currentSelection);
      this.table.addSelection(_currentSelection);
    }
  }
  /**
   *
   */
  ;

  _proto.onMouseUp = function onMouseUp() {
    event.preventDefault();
    this.table.finishSelection();
  }
  /**
   *
   */
  ;

  _proto.onMouseMove = function onMouseMove(event) {
    event.preventDefault();
    var coord = this.getCoords(event);
    this.table.getCellByCoord(coord);
    var currentSelection = this.table.currentSelection;

    if (currentSelection && currentSelection.isInProgress()) {
      var colIdx = this.table.getColIdx(coord.x);
      var rowIdx = this.table.getRowIdx(coord.y);
      currentSelection.select(colIdx, rowIdx);
    } else {
      this.table.mouseInCell(coord);
    }
  }
  /**
   *
   */
  ;

  _proto.onResize = function onResize() {}
  /**
   *
   */
  ;

  _proto.onContextMenu = function onContextMenu(event) {
    event.preventDefault();
    this.table.showContextMenu(this.getCoords(event));
  };

  _proto.onContextMenuItemSelect = function onContextMenuItemSelect(action, item) {
    var currentSelection = this.table.currentSelection;

    if (currentSelection && action) {
      var hasBindEvent = this.schedule.emit(events.CONTEXT_MENU_ITEM_SELECT, action, this.schedule, currentSelection.getCell().data, item);

      if (!hasBindEvent && action === 'delete') {
        currentSelection.deleteCell();
      }
    }
  };

  _proto.onKeydown = function onKeydown(event) {// if (keycode(event) === 'backspace') {
    //   this.table.currentSelection.deleteCell()
    // }
  }
  /**
   *
   */
  ;

  _proto.clear = function clear() {
    this.container.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('mousemove', this.onMouseMove);
    this.container.removeEventListener('contextmenu', this.onContextMenu);
    document.removeEventListener('keydown', this.onKeydown);
  };

  _proto.getCoords = function getCoords(event) {
    var _this$canvas$getBound = this.canvas.getBoundingClientRect(),
        left = _this$canvas$getBound.left,
        top = _this$canvas$getBound.top;

    return {
      x: event.clientX - left,
      y: event.clientY - top
    };
  };

  return Events;
}();

/**
 * @description
 *
 * ## 构造器选项.
 *
 * 构造器选项通过第二个参数传入.
 *
 * ```js
 * new Schedule(document.getElementById('example'), {
 *  data: array,
 *  yearMonth: '2020-01'
 * })
 * ```
 *
 */
var settingsFactory = (function () {
  return {
    /**
     * @memberof Options#
     * @param {object[]}
     * @default undefined
     */
    data: void 0,

    /**
     * 当前排期表年月，不传则是当前月，会自动计算出当月天数。
     *
     * @memberof Options#
     * @param {string}
     * @default undefined
     * @example
     * ```js
     * yearMonth: '2015-01'
     * ```
     */
    yearMonth: void 0,

    /**
     * 行数/小时数
     * @param {number}
     * @default 24
     */
    numberOfRows: 24,

    /**
     * 只读模式
     * @param {boolean}
     * @default false
     */
    readOnly: false,

    /**
     * 表格背景色.
     * @param {string}
     * @default '#fff'
     */
    bgColor: '#ffffff',

    /**
     * 格子边框色
     * @param {string}
     * @default '#EBEEF5'
     */
    cellBorderColor: '#EBEEF5',

    /**
     * 格子边框宽度
     * @param {string}
     * @default 1
     */
    cellBorderWidth: 1,

    /**
     * 格子选中背景色
     * @param {string}
     * @default '#EBEEF5'
     */
    cellSelectedColor: '#EBEEF5',

    /**
     * 格子创建颜色
     * @param {string}
     * @default '#D9D6EE'
     */
    cellActiveColor: '#D9D6EE',

    /**
     * 跨天格子透明度
     * @param {number}
     * @default 0.4
     */
    cellCrossColAlpha: 0.4,

    /**
     * 纵轴标题宽度
     * @param {number}
     * @default 50
     */
    colHeaderWidth: 50,

    /**
     * 水平标题高度，不设置将和自动计算的格子高度一致
     * @param {number}
     * @default undefined
     */
    rowHeaderHeight: void 0,

    /**
     * 格子字体大小
     * @param {number}
     * @default 12
     */
    fontSize: 12,

    /**
     * 字体
     * @param {string}
     * @default 'PingFang SC,Helvetica Neue,Helvetica,microsoft yahei,arial,STHeiTi,sans-serif'
     */
    fontFamily: 'PingFang SC,Helvetica Neue,Helvetica,microsoft yahei,arial,STHeiTi,sans-serif',
    fontColor: '#fff',

    /**
     * 行高
     * @param {number}
     * @default 20
     */
    lineHeight: 20,

    /**
     * 格子字体颜色
     * @param {string}
     * @default '#fff'
     */
    cellTextColor: '#fff',

    /**
     * 标题字体颜色
     * @param {string}
     * @default '#606266'
     */
    headerTextColor: '#606266',

    /**
     * 时间范围 key 值
     * @param {string[]}
     * @default 'timeRange'
     */
    timeRangeKey: 'timeRange',

    /**
     * icon 最大宽度
     * @param {number}
     * @default '36'
     */
    iconMaxWidth: 36,

    /**
     * 颜色对应的 key 值
     * @param {number}
     * @default 'color'
     */
    colorKey: 'color',

    /**
     * 图标对应的 key 值
     * @param {number}
     * @default 'icon'
     */
    iconKey: 'icon',

    /**
     * 格子显示的文案 key 值，字符串数组，隔行显示
     * @param {string[]}
     * @default 'texts'
     */
    textsKey: 'texts',

    /**
     * 为 color、icon、texts 设置值映射关系
     * @param {object}
     * @default 'texts'
     * @example
     * ```js
     * dataMaps: {
     *  color: [
     *   { key: 'L1', value: '#64C42D' },
     *   { key: 'L2', value: '#E8A32F' },
     *   { key: 'L3', value: '#F76B69' },
     *  ]
     * }
     * ```
     */
    dataMaps: void 0,

    /**
     * 时间精确度，假如设置为 0.5，则一格为 0.5 小时
     * @param {number}
     * @default 1
     */
    timeScale: 1,

    /**
     * 悬浮 tooltip 背景颜色
     * @param {string}}
     * @default '#707070'
     */
    tooltipColor: '#707070',

    /**
     * 自定义渲染 tooltip 内容，return 一个 html 字符串,
     * 如果使用函数返回，当前格子的 data 将作为参数返回
     * @param {string|Function}}
     * @default undefined
     * @example
     * ```js
     * // 直接设置字符串
     * renderTooltip: '标题'
     *
     * // 通过函数
     * renderTooltip: function (data) {
     *   return `<p>Level: ${data.level}</p>`
     * }
     * ```
     */
    renderTooltip: function renderTooltip() {},

    /**
     * 自定义渲染单元格，return 一个对象，包含 texts数组、color字符串、icon字符串
     * 当前格子的 data 将作为参数返回
     * @param {Function}
     * @default undefined
     */
    renderCell: void 0,

    /**
     * 右键菜单项目列表，然后可以通过 on 方法监听设置事件方法
     * @param {object[]}
     * @default undefined
     * @example
     * ```js
     * contextMenuItems: [
     *   { action: 'setLevel', title: '设置主播' }
     * ]
     * ```
     */
    contextMenuItems: void 0
  };
});

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z$3 = ".schedule-canvas-container {\n  position: relative;\n}";
styleInject(css_248z$3);

var css_248z$2 = ".schedule-highlight {\n  position: absolute;\n  top: 0;\n  left: 0;\n  border: 2px solid #999999;\n  pointer-events: none;\n  margin: -2px;\n  visibility: hidden;\n}\n\n.schedule-highlight-up-resize {\n  position: absolute;\n  width: 100%;\n  height: 8px;\n  top: -2px;\n  left: 0;\n  cursor: row-resize;\n  pointer-events: all;\n}\n\n.schedule-highlight-down-resize {\n  position: absolute;\n  width: 100%;\n  height: 8px;\n  bottom: -2px;\n  left: 0;\n  cursor: row-resize;\n  pointer-events: all;\n}\n\n.schedule-highlight.disabled-up-resize {\n  border-top-style: dotted;\n}\n\n.schedule-highlight.disabled-up-resize .schedule-highlight-up-resize {\n  pointer-events: none;\n}\n\n.schedule-highlight.disabled-down-resize {\n  border-bottom-style: dotted;\n}\n\n.schedule-highlight.disabled-down-resize .schedule-highlight-down-resize {\n  pointer-events: none;\n}\n\n.schedule-multi-select .schedule-highlight-up-resize, \n.schedule-multi-select .schedule-highlight-down-resize {\n  pointer-events: none;\n}";
styleInject(css_248z$2);

var css_248z$1 = ".schedule-contextmenu {\n  position: absolute;\n  left: 0;\n  top: 0;\n  padding: 5px 0;\n  margin: 0;\n  background: #707070;\n  border: 1px solid #707070;\n  border-radius: 4px;\n  box-shadow: 2px 2px 8px 0px rgba(150, 150, 150, 0.2);\n  list-style: none;\n  font-size: 14px;\n  white-space: nowrap;\n  cursor: pointer;\n  z-index: 2800;\n  -webkit-tap-highlight-color: transparent;\n}\n\n.schedule-contextmenu-item {\n  padding: 5px 14px;\n  line-height: 1;\n  color: #fff;\n}\n\n.schedule-contextmenu-item:hover {\n  background: #585858;\n}";
styleInject(css_248z$1);

var css_248z = ".schedule-tooltip {\n  position: absolute;\n  left: 0;\n  top: 0;\n  line-height: 20px;\n  padding: 5px;\n  opacity: 0.9;\n  color: #ffffff;\n  font-size: 14px;\n  pointer-events: none;\n  border-radius: 4px;\n  z-index: 999;\n  background:#707070;\n  visibility: hidden;\n  word-break: break-all;\n}\n.schedule-tooltip-icon {\n  width: 24px;\n  height: 24px;\n}\n.schedule-tooltip p {\n  margin: 0;\n  max-width: 200px;\n}";
styleInject(css_248z);

/**
 * Schedule.
 *
 * @class Schedule.
 */

var Schedule = /*#__PURE__*/function () {
  /**
   *
   * @param {HTMLElement} rootNode The elment which the Schedule instance is injected.
   * @param {object} userSettings The user defined options.
   */
  function Schedule(rootNode, userSettings) {
    /**
     * The root node to which newly created table will be inserted.
     * @type {HTMLElement}
     */
    this.rootNode = rootNode;
    /**
     * Cache the canvas element.
     * @type {HTMLElement}
     */

    this.canvas = null;
    /**
     * The container which newly created element.
     * @type {HTMLElement}
     */

    this.container = null;
    this.userSettings = userSettings;
    this.createCanvas();
    this.defaultSettings = settingsFactory();
    this.settings = _extends_1({}, this.defaultSettings, this.userSettings);
    this.settings.contextMenuItems = this.combineContextMenuItems(userSettings.contextMenuItems || [], [{
      action: 'delete',
      title: '删除'
    }]);
    this.settings.yearMonth = dayjs_min(userSettings.yearMonth);
    this.settings.numberOfCols = this.settings.yearMonth.daysInMonth();
    var items = this.getItemsFromData(this.settings.data); // Create table renderer for the schedule.

    this.table = new Table(this, items, {
      cells: new Cells(this),
      rowHeader: new RowHeader(this),
      colHeader: new ColHeader(this),
      highlights: new Highlights(this.container),
      contextMenu: new ContextMenu(this.container, this.settings.contextMenuItems),
      tooltip: new Tooltip(this.container, this.settings.tooltipColor)
    });
    this.events = new Events(this);
    this.render();
  }
  /**
   * Create the canvas element and insert to the root node.
   */


  var _proto = Schedule.prototype;

  _proto.createCanvas = function createCanvas() {
    this.canvas = document.createElement('canvas');
    this.container = document.createElement('div');
    this.container.className = 'schedule-canvas-container';
    this.container.appendChild(this.canvas);
    this.rootNode.prepend(this.container);
  };

  _proto.render = function render() {
    var _this = this;

    var _this$rootNode$getBou = this.rootNode.getBoundingClientRect(),
        width = _this$rootNode$getBou.width,
        height = _this$rootNode$getBou.height;

    this.table.render(width, height);
    var ro = new ResizeObserver(function (entries, _) {
      var _entries$0$contentRec = entries[0].contentRect,
          width = _entries$0$contentRec.width,
          height = _entries$0$contentRec.height;

      _this.table.render(width, height);
    });
    ro.observe(this.rootNode);
  };

  _proto.combineContextMenuItems = function combineContextMenuItems() {
    var _contextMenuItems = [];

    for (var _len = arguments.length, contextMenuItems = new Array(_len), _key = 0; _key < _len; _key++) {
      contextMenuItems[_key] = arguments[_key];
    }

    contextMenuItems.reduce(function (previousValue, currentValue, _) {
      return [].concat(previousValue, currentValue);
    }, []).forEach(function (item) {
      return !_contextMenuItems.find(function (i) {
        return i.action === item.action;
      }) && _contextMenuItems.push(item);
    });
    return _contextMenuItems;
  };

  _proto.setData = function setData(data) {
    var items = this.getItemsFromData(data);
    var oldItem = this.getItemsFromData(this.getData());
    this.table.setItems(items, oldItem);
  };

  _proto.setDataAtSelectedCell = function setDataAtSelectedCell(callback) {
    var selectedCells = [];
    this.table.cellsEach(function (cell) {
      cell.selected && cell.isVisible() && selectedCells.push(cell);
    });
    var data = typeof callback === 'function' ? callback() : callback || {};

    if (selectedCells.length === 1) {
      var currentSelectedCell = selectedCells[0];
      var timeRangeKey = this.table.settings.timeRangeKey;

      if (data[timeRangeKey] && currentSelectedCell.data[timeRangeKey] && !isSame(currentSelectedCell.data[timeRangeKey], data[timeRangeKey])) {
        var _this$getCellConfigFr = this.getCellConfigFromTimeRange(data[timeRangeKey]),
            colIdx = _this$getCellConfigFr.colIdx,
            rowIdx = _this$getCellConfigFr.rowIdx,
            rowSpan = _this$getCellConfigFr.rowSpan;

        var cell = this.table.getCell(colIdx, rowIdx);

        var oriData = _extends_1({}, currentSelectedCell.data, data);

        currentSelectedCell.delete();
        var cellsToMerge = this.table.getCellsBetween(cell, this.table.getCell(cell.colIdx, cell.rowIdx + rowSpan));
        cell.data = oriData;
        cell.merge(cellsToMerge);
        this.table.currentSelection.refresh(cell);
        return;
      }
    }

    selectedCells.forEach(function (cell) {
      return cell.setData(data);
    });
  };

  _proto.getCellConfigFromTimeRange = function getCellConfigFromTimeRange(timeRange) {
    var timeScale = this.settings.timeScale;
    var startTime = timeRange[0],
        endTime = timeRange[1];
    var time = dayjs_min(startTime);
    var colIdx = time.date() - 1;
    var rowIdx = (time.hour() * 60 + time.minute()) / 60 / timeScale;
    var minutes = Math.abs(time.diff(endTime, 'minute'));
    var rowSpan = minutes / (timeScale * 60) - 1;
    return {
      colIdx: colIdx,
      rowIdx: rowIdx,
      rowSpan: rowSpan
    };
  };

  _proto.getItemsFromData = function getItemsFromData(data) {
    var _this2 = this;

    var _this$settings = this.settings,
        timeRangeKey = _this$settings.timeRangeKey;
        _this$settings.timeScale;
    return data.map(function (live) {
      var _this2$getCellConfigF = _this2.getCellConfigFromTimeRange(live[timeRangeKey]),
          colIdx = _this2$getCellConfigF.colIdx,
          rowIdx = _this2$getCellConfigF.rowIdx,
          rowSpan = _this2$getCellConfigF.rowSpan;

      return {
        colIdx: colIdx,
        rowIdx: rowIdx,
        rowSpan: rowSpan,
        data: live
      };
    });
  };

  _proto.getData = function getData() {
    var data = [];
    this.table.cellGroupsEach(function (cell) {
      if (cell.hasData()) {
        data.push(cell.data);
      }
    });
    return data;
  };

  _proto.exportData = function exportData() {};

  _proto.getCellTimeStr = function getCellTimeStr(cell) {
    return cell.colIdx + 1 + ", " + cell.timeRange.map(function (t) {
      return t.format('HH:mm');
    }).join('~');
  }
  /**
   *
   * @param {*} cell
   */
  ;

  _proto.getTooltipConfig = function getTooltipConfig(cell) {
    var _cell$getCoords = cell.getCoords(),
        x = _cell$getCoords.x,
        y = _cell$getCoords.y;

    var renderTooltip = this.settings.renderTooltip;
    var tooltipText = cell.data && renderTooltip ? renderTooltip(cell.data) : '';
    return {
      x: x + cell.width,
      y: y,
      text: "<p>" + this.getCellTimeStr(cell) + "</p>" + tooltipText,
      color: cell.hasData() ? cell.getColor() : null,
      icon: cell.getIcon(),
      cellWidth: cell.width
    };
  };

  _proto.hideTooltip = function hideTooltip() {
    this.table.tooltip.hide();
  }
  /**
   *
   * @param {object} config
   * @param {number} config.x
   * @param {number} config.y
   * @param {string} config.text
   * @param {string} config.icon
   */
  ;

  _proto.showTooltip = function showTooltip(cell) {
    if (!cell) {
      return;
    }

    var config = this.getTooltipConfig(cell);
    this.table.tooltip.show(config);
  };

  _proto.destroy = function destroy() {
    if (this.events) {
      this.events.clear();
    }
  };

  _proto.deleteSelectedCell = function deleteSelectedCell() {
    if (this.table.currentSelection) {
      this.table.currentSelection.deleteCell();
    }
  };

  _proto.getCanvas = function getCanvas() {
    return this.canvas;
  };

  return Schedule;
}();
Object.assign(Schedule.prototype, eventMixin);
Schedule.settingsFactory = settingsFactory;

return Schedule;

})));
