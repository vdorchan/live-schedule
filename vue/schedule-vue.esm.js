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
        return Object.freeze(this);
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
    return Object.freeze({
        inlineSize: (switchSizes ? blockSize : inlineSize) || 0,
        blockSize: (switchSizes ? inlineSize : blockSize) || 0
    });
};
var zeroBoxes = Object.freeze({
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
    var boxes = Object.freeze({
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
        this.borderBoxSize = [boxes.borderBoxSize];
        this.contentBoxSize = [boxes.contentBoxSize];
        this.devicePixelContentBoxSize = [boxes.devicePixelContentBoxSize];
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
var events = [
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
            events.forEach(function (name) { return global$1.addEventListener(name, _this.listener, true); });
        }
    };
    Scheduler.prototype.stop = function () {
        var _this = this;
        if (!this.stopped) {
            this.observer && this.observer.disconnect();
            events.forEach(function (name) { return global$1.removeEventListener(name, _this.listener, true); });
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

var dayjs_min = createCommonjsModule(function (module, exports) {
!function(t,e){module.exports=e();}(commonjsGlobal,function(){var t="millisecond",e="second",n="minute",r="hour",i="day",s="week",u="month",a="quarter",o="year",f="date",h=/^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[^0-9]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?.?(\d{1,3})?$/,c=/\[([^\]]+)]|Y{2,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,d=function(t,e,n){var r=String(t);return !r||r.length>=e?t:""+Array(e+1-r.length).join(n)+t},$={s:d,z:function(t){var e=-t.utcOffset(),n=Math.abs(e),r=Math.floor(n/60),i=n%60;return (e<=0?"+":"-")+d(r,2,"0")+":"+d(i,2,"0")},m:function t(e,n){if(e.date()<n.date())return -t(n,e);var r=12*(n.year()-e.year())+(n.month()-e.month()),i=e.add(r,u),s=n-i<0,a=e.add(r+(s?-1:1),u);return +(-(r+(n-i)/(s?i-a:a-i))||0)},a:function(t){return t<0?Math.ceil(t)||0:Math.floor(t)},p:function(h){return {M:u,y:o,w:s,d:i,D:f,h:r,m:n,s:e,ms:t,Q:a}[h]||String(h||"").toLowerCase().replace(/s$/,"")},u:function(t){return void 0===t}},l={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_")},y="en",M={};M[y]=l;var m=function(t){return t instanceof S},D=function(t,e,n){var r;if(!t)return y;if("string"==typeof t)M[t]&&(r=t),e&&(M[t]=e,r=t);else {var i=t.name;M[i]=t,r=i;}return !n&&r&&(y=r),r||!n&&y},v=function(t,e){if(m(t))return t.clone();var n="object"==typeof e?e:{};return n.date=t,n.args=arguments,new S(n)},g=$;g.l=D,g.i=m,g.w=function(t,e){return v(t,{locale:e.$L,utc:e.$u,$offset:e.$offset})};var S=function(){function d(t){this.$L=this.$L||D(t.locale,null,!0),this.parse(t);}var $=d.prototype;return $.parse=function(t){this.$d=function(t){var e=t.date,n=t.utc;if(null===e)return new Date(NaN);if(g.u(e))return new Date;if(e instanceof Date)return new Date(e);if("string"==typeof e&&!/Z$/i.test(e)){var r=e.match(h);if(r){var i=r[2]-1||0;return n?new Date(Date.UTC(r[1],i,r[3]||1,r[4]||0,r[5]||0,r[6]||0,r[7]||0)):new Date(r[1],i,r[3]||1,r[4]||0,r[5]||0,r[6]||0,r[7]||0)}}return new Date(e)}(t),this.init();},$.init=function(){var t=this.$d;this.$y=t.getFullYear(),this.$M=t.getMonth(),this.$D=t.getDate(),this.$W=t.getDay(),this.$H=t.getHours(),this.$m=t.getMinutes(),this.$s=t.getSeconds(),this.$ms=t.getMilliseconds();},$.$utils=function(){return g},$.isValid=function(){return !("Invalid Date"===this.$d.toString())},$.isSame=function(t,e){var n=v(t);return this.startOf(e)<=n&&n<=this.endOf(e)},$.isAfter=function(t,e){return v(t)<this.startOf(e)},$.isBefore=function(t,e){return this.endOf(e)<v(t)},$.$g=function(t,e,n){return g.u(t)?this[e]:this.set(n,t)},$.unix=function(){return Math.floor(this.valueOf()/1e3)},$.valueOf=function(){return this.$d.getTime()},$.startOf=function(t,a){var h=this,c=!!g.u(a)||a,d=g.p(t),$=function(t,e){var n=g.w(h.$u?Date.UTC(h.$y,e,t):new Date(h.$y,e,t),h);return c?n:n.endOf(i)},l=function(t,e){return g.w(h.toDate()[t].apply(h.toDate("s"),(c?[0,0,0,0]:[23,59,59,999]).slice(e)),h)},y=this.$W,M=this.$M,m=this.$D,D="set"+(this.$u?"UTC":"");switch(d){case o:return c?$(1,0):$(31,11);case u:return c?$(1,M):$(0,M+1);case s:var v=this.$locale().weekStart||0,S=(y<v?y+7:y)-v;return $(c?m-S:m+(6-S),M);case i:case f:return l(D+"Hours",0);case r:return l(D+"Minutes",1);case n:return l(D+"Seconds",2);case e:return l(D+"Milliseconds",3);default:return this.clone()}},$.endOf=function(t){return this.startOf(t,!1)},$.$set=function(s,a){var h,c=g.p(s),d="set"+(this.$u?"UTC":""),$=(h={},h[i]=d+"Date",h[f]=d+"Date",h[u]=d+"Month",h[o]=d+"FullYear",h[r]=d+"Hours",h[n]=d+"Minutes",h[e]=d+"Seconds",h[t]=d+"Milliseconds",h)[c],l=c===i?this.$D+(a-this.$W):a;if(c===u||c===o){var y=this.clone().set(f,1);y.$d[$](l),y.init(),this.$d=y.set(f,Math.min(this.$D,y.daysInMonth())).$d;}else $&&this.$d[$](l);return this.init(),this},$.set=function(t,e){return this.clone().$set(t,e)},$.get=function(t){return this[g.p(t)]()},$.add=function(t,a){var f,h=this;t=Number(t);var c=g.p(a),d=function(e){var n=v(h);return g.w(n.date(n.date()+Math.round(e*t)),h)};if(c===u)return this.set(u,this.$M+t);if(c===o)return this.set(o,this.$y+t);if(c===i)return d(1);if(c===s)return d(7);var $=(f={},f[n]=6e4,f[r]=36e5,f[e]=1e3,f)[c]||1,l=this.$d.getTime()+t*$;return g.w(l,this)},$.subtract=function(t,e){return this.add(-1*t,e)},$.format=function(t){var e=this;if(!this.isValid())return "Invalid Date";var n=t||"YYYY-MM-DDTHH:mm:ssZ",r=g.z(this),i=this.$locale(),s=this.$H,u=this.$m,a=this.$M,o=i.weekdays,f=i.months,h=function(t,r,i,s){return t&&(t[r]||t(e,n))||i[r].substr(0,s)},d=function(t){return g.s(s%12||12,t,"0")},$=i.meridiem||function(t,e,n){var r=t<12?"AM":"PM";return n?r.toLowerCase():r},l={YY:String(this.$y).slice(-2),YYYY:this.$y,M:a+1,MM:g.s(a+1,2,"0"),MMM:h(i.monthsShort,a,f,3),MMMM:h(f,a),D:this.$D,DD:g.s(this.$D,2,"0"),d:String(this.$W),dd:h(i.weekdaysMin,this.$W,o,2),ddd:h(i.weekdaysShort,this.$W,o,3),dddd:o[this.$W],H:String(s),HH:g.s(s,2,"0"),h:d(1),hh:d(2),a:$(s,u,!0),A:$(s,u,!1),m:String(u),mm:g.s(u,2,"0"),s:String(this.$s),ss:g.s(this.$s,2,"0"),SSS:g.s(this.$ms,3,"0"),Z:r};return n.replace(c,function(t,e){return e||l[t]||r.replace(":","")})},$.utcOffset=function(){return 15*-Math.round(this.$d.getTimezoneOffset()/15)},$.diff=function(t,f,h){var c,d=g.p(f),$=v(t),l=6e4*($.utcOffset()-this.utcOffset()),y=this-$,M=g.m(this,$);return M=(c={},c[o]=M/12,c[u]=M,c[a]=M/3,c[s]=(y-l)/6048e5,c[i]=(y-l)/864e5,c[r]=y/36e5,c[n]=y/6e4,c[e]=y/1e3,c)[d]||y,h?M:g.a(M)},$.daysInMonth=function(){return this.endOf(u).$D},$.$locale=function(){return M[this.$L]},$.locale=function(t,e){if(!t)return this.$L;var n=this.clone(),r=D(t,e,!0);return r&&(n.$L=r),n},$.clone=function(){return g.w(this.$d,this)},$.toDate=function(){return new Date(this.valueOf())},$.toJSON=function(){return this.isValid()?this.toISOString():null},$.toISOString=function(){return this.$d.toISOString()},$.toString=function(){return this.$d.toUTCString()},d}(),p=S.prototype;return v.prototype=p,[["$ms",t],["$s",e],["$m",n],["$H",r],["$W",i],["$M",u],["$y",o],["$D",f]].forEach(function(t){p[t[1]]=function(e){return this.$g(e,t[0],t[1])};}),v.extend=function(t,e){return t(e,S,v),v},v.locale=D,v.isDayjs=m,v.unix=function(t){return v(1e3*t)},v.en=M[y],v.Ls=M,v});
});

function numberEach(cb, from, to) {
  const iterate = from > to ? () => from-- : () => from++;
  const isEnd = from > to ? () => from < to : () => from > to;
  let isStop = false;

  while (!isEnd() && !isStop) {
    isStop = cb(iterate(from)) === false;
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
  const itemIndex = array.findIndex(callback);

  if (itemIndex > -1) {
    return array.splice(itemIndex, 1)[0];
  }
}
function isSame(a, b) {
  const aType = typeof a;
  const bType = typeof b;

  if (aType !== bType) {
    return false;
  }

  const type = aType;

  if (['string', 'number', 'undefined'].includes(type) || a === null || b === null) {
    return a === b;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    return a.every((item, idx) => isSame(item, b[idx]));
  }

  if (type === 'object') {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    return aKeys.length === bKeys.length && aKeys.every(key => isSame(a[key], b[key]));
  }

  return true;
}
function diff(a, b) {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  const changedKeys = [];
  new Set([...aKeys, ...bKeys]).forEach(key => {
    if (!aKeys.includes(key) || !bKeys.includes(key) || !isSame(a[key], b[key])) {
      changedKeys.push({
        key,
        value: [a[key], b[key]]
      });
    }
  });
  return changedKeys;
}
function formatTimeRange(timeRange, formatStr) {
  return timeRange.map(t => t.format(formatStr));
}

function dpr() {
  return window.devicePixelRatio || 1;
}

function npx(px) {
  return parseInt(px * dpr(), 10);
}

class Draw {
  constructor(el, width, height) {
    this.el = el;
    this.ctx = el.getContext('2d');
    this.resize(width, height);
    this.__cacheImgs = [];
  }

  _getImage(src) {
    return new Promise(resolve => {
      let img = this.__cacheImgs.find(i => i.src === location.origin + src);

      if (img) {
        return resolve(img);
      }

      img = new Image();

      img.onload = () => {
        this.__cacheImgs.push(img);

        resolve(img);
      };

      img.src = src;
    });
  }

  resize(width, height) {
    this.el.style.width = `${width}px`;
    this.el.style.height = `${height}px`;
    this.el.width = npx(width);
    this.el.height = npx(height);
    this.ctx.scale(dpr(), dpr());
  }

  rect(config = {}) {
    const {
      ctx
    } = this;
    const {
      x,
      y,
      width,
      height,
      borderColor,
      borderWidth,
      borderTop,
      borderRight,
      borderBottom
    } = config;
    let {
      fill
    } = config;
    ctx.save();
    const alpha = getAlphaFromHex(fill);

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
      this.border({ ...config,
        x: config.x - borderWidth,
        y: config.y - borderWidth,
        borderWidth,
        borderColor,
        borderTop,
        borderRight,
        borderBottom
      });
    }
  }

  text(config = {}) {
    const {
      x,
      y,
      maxWidth,
      fill,
      text,
      fontSize,
      fontFamily
    } = config;
    this.ctx.save();
    if (fontSize) this.ctx.fontSize = fontSize;
    if (fontFamily) this.ctx.fontFamily = fontFamily;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = fill;
    this.ctx.fillText(text, x, y, maxWidth);
    this.ctx.restore();
  }

  async image(config = {}) {
    const {
      x,
      y,
      width,
      height,
      src
    } = config;
    const img = await this._getImage(src);
    this.ctx.drawImage(img, Math.floor(x), Math.floor(y), width, height);
  }

  border(config = {}) {
    const {
      ctx
    } = this;
    const {
      width,
      height,
      x,
      y,
      borderTop = true,
      borderRight = true,
      borderBottom = true,
      // borderLeft = true,
      fill,
      borderWidth,
      borderColor
    } = config;
    ctx.save();
    ctx.lineWidth = borderWidth;

    const drawLine = (border, from, to) => {
      ctx.beginPath();
      ctx.strokeStyle = border ? borderColor : fill;
      ctx.moveTo(...from);
      ctx.lineTo(...to);
      ctx.stroke();

      if (border === 'dash') {
        ctx.setLineDash([5, 6]);
        drawLine(false, from, to);
        ctx.setLineDash([]);
      }
    };

    const right = x + borderWidth * 2 + width;
    const bottom = y + borderWidth * 2 + height;
    const halfBorderWidth = borderWidth / 2;
    drawLine(borderTop, [x, y + halfBorderWidth], [right, y + halfBorderWidth]);
    drawLine(borderRight, [right - halfBorderWidth, y], [right - halfBorderWidth, bottom]);
    drawLine(borderBottom, [right, bottom - halfBorderWidth], [x, bottom - halfBorderWidth]);
    drawLine(borderRight, [x + halfBorderWidth, bottom], [x + halfBorderWidth, y]);
    ctx.restore();
  }

}

const CONTEXTMENU_CLASS = 'schedule-contextmenu';
const CONTEXTMENU_ITEM_CLASS = 'schedule-contextmenu-item';
class ContextMenu {
  constructor(container, items) {
    this.container = container;

    this.onSelect = () => {};

    const ul = document.createElement('ul');
    ul.className = CONTEXTMENU_CLASS;
    items.forEach(m => {
      const li = document.createElement('li');
      li.className = CONTEXTMENU_ITEM_CLASS;
      li.innerText = m.title;
      li.dataset.action = m.action;
      ul.appendChild(li);
    });
    this.menu = ul;
    this.hide = this.hide.bind(this);
    this.hide();
    window.addEventListener('click', this.hide);

    ul.onclick = event => {
      this.hide();
      const action = event.target.dataset.action;

      if (action) {
        this.onSelect(action, items.find(item => item.action === action));
      }
    };

    this.container.appendChild(this.menu);
  }

  onContextMenuItemSelect(onSelect) {
    this.onSelect = onSelect;
  }

  isVisible() {
    return this.menu.style.visibility === 'visible';
  }

  show({
    x,
    y
  }) {
    this.menu.style.visibility = 'visible';
    this.menu.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }

  hide() {
    this.menu.style.visibility = 'hidden';
  }

}

const events$1 = {
  CONTEXT_MENU_ITEM_SELECT: 'contextMenuItemSelect',
  SELECTE: 'select',
  DATA_CHANGE: 'dataChange',
  TIME_RANGE_CHANGE: 'timeRangeChange'
};
const eventMixin = {
  /**
   * Subscribe to event, usage:
   *  schedule.on('select', (item) => { ... }
   */
  on(eventName, handler) {
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
  off(eventName, handler) {
    const handlers = this._eventHandlers[eventName];
    if (!handlers) return;

    for (let i = 0; i < handlers.length; i++) {
      if (handlers[i] === handler) {
        handlers.splice(i--, 1);
      }
    }
  },

  /**
   * Generate an event with the given name and data
   *  this.emit('select', ...)
   */
  emit(eventName, ...args) {
    if (!this._eventHandlers || !this._eventHandlers[eventName] || !this._eventHandlers[eventName].length) {
      return false; // no handlers for that event name
    } // call the handlers


    this._eventHandlers[eventName].forEach(handler => handler.apply(this, args));

    return true;
  }

};

/**
 * Table render and managing.
 * @class {Table}
 */

class Table {
  constructor(schedule, items, {
    cells,
    rowHeader,
    colHeader,
    highlights,
    contextMenu,
    tooltip
  } = {}) {
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

  setItems(items, oldItems) {
    const itemsToDelete = [...oldItems];
    const itemsToRender = [];
    items.forEach(item => {
      const oldItem = arrayRemoveItem(itemsToDelete, i => i.colIdx === item.colIdx && i.rowIdx === item.rowIdx);

      if (oldItem) {
        const changedKeys = diff(item.data, oldItem.data);

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

    itemsToDelete.forEach(item => {
      const cell = this.getCell(item.colIdx, item.rowIdx);

      if (cell.hasData()) {
        if (this.currentSelection) {
          this.currentSelection.deleteCell(cell);
        } else {
          cell.delete();
        }
      }
    });
    this.items = items;
  }

  resize(tableWidth, tableHeight) {
    if (tableWidth === this.tableWidth && tableHeight === this.tableHeight) {
      return;
    }

    this.render(tableWidth, tableHeight);
  }
  /**
   * Render the Table.
   * @param {number} tableWidth Width of Table.
   * @param {number} tableHeight Height of Table.
   */


  render(tableWidth, tableHeight) {
    this.tableWidth = tableWidth;
    this.tableHeight = tableHeight;

    if (!this.draw) {
      this.draw = new Draw(this.canvas, tableWidth, tableHeight);
    } else {
      this.draw.resize(tableWidth, tableHeight);
    }

    const {
      fontSize,
      fontFamily,
      numberOfCols,
      numberOfRows,
      cellBorderWidth,
      colHeaderWidth,
      timeScale
    } = this.settings;
    /**
     * Set global font config.
     */

    this.draw.ctx.font = `${fontSize}px ${fontFamily}`;
    /**
     * Set instance of Draw.
     */

    this.cells.setRenderer(this.draw);
    this.rowHeader.setRenderer(this.draw);
    this.colHeader.setRenderer(this.draw); // calculate width of col.

    this.cellWidth = Math.floor((tableWidth - cellBorderWidth - colHeaderWidth) / numberOfCols); // calculate height of row.

    const totalNumberOfRows = numberOfRows + (this.rowHeader ? 1 : 0);
    this.cellHeight = Math.floor((tableHeight - cellBorderWidth) / totalNumberOfRows) * timeScale; // Set width of height of row header.

    this.settings.rowHeaderHeight = this.cellHeight / timeScale;
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


  cellsEach(cb, config) {
    this.cells.cellsEach(cb, config);
  }
  /**
   *
   * @param {Function} cb
   * @param {Object} config
   */


  cellGroupsEach(cb, config) {
    return this.cells.cellGroupsEach(cb, config);
  }
  /**
   * Get cell specified by index of column and index of row.
   * @param {number} colIdx Index of col.
   * @param {*} rowIdx  Index of row.
   * @param {boolean} crossCol Cross col when col index bigger than max col idx.
   */


  getCell(colIdx, rowIdx, crossCol) {
    return this.cells.getCell(colIdx, rowIdx, crossCol);
  }
  /**
   * Return column index specified x coord.
   * @param {number} x
   */


  getColIdx(x) {
    return Math.floor((x - this.cells.startingCoords.x) / this.cellWidth);
  }
  /**
   * Return row index specified y coord.
   * @param {number} y
   */


  getRowIdx(y) {
    return Math.floor((y - this.cells.startingCoords.y) / this.cellHeight);
  }
  /**
   * Return cell specified y coords.
   * @param {number} coords
   * @param {boolean} crossCol Cross col when col index bigger than max col idx.
   */


  getCellByCoord({
    x,
    y
  }, crossCol) {
    const colIdx = Math.floor((x - this.cells.startingCoords.x) / this.cellWidth);
    const rowIdx = Math.floor((y - this.cells.startingCoords.y) / this.cellHeight);
    return this.getCell(colIdx, rowIdx, crossCol);
  }
  /**
   *
   * @param {array} cells
   * @param {boolean} reverse
   */


  sort(cells, reverse) {
    const judge = (a, b) => reverse ? a > b : a < b;

    return [...cells].sort((a, b) => {
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


  getCellsBetween(cellFrom, cellTo, filter) {
    const [_cellFrom, _cellTo] = this.sort([cellFrom, cellTo]);
    const cellsBetween = [];
    this.cellsEach(cell => {
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


  getEmptyCellsBetween(cellFrom, cellTo) {
    return this.getCellsBetween(cellFrom, cellTo, cell => cell.hasData() && !cell.isSame(_cellFrom));
  }
  /**
   * Select multiple cells.
   * @param {Cell} oriCell
   * @param {number} colTo
   * @param {number} rowIdx
   * @returns {Array} Selected Cells.
   */


  selectMultiCols(oriCell, colTo, rowIdx) {
    let colFrom = oriCell.colIdx;
    const selectedCells = [];

    let isEnd = () => colFrom <= colTo;

    let iterate = () => colFrom++;

    if (colFrom > colTo) {
      isEnd = () => colFrom >= colTo;

      iterate = () => colFrom--;
    }

    while (isEnd()) {
      const cellFrom = this.getCell(iterate(), oriCell.rowIdx);
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


  mergeCols(cellFrom, rowIdx) {
    const cellTo = this.getCell(cellFrom.colIdx, rowIdx);
    const cellsToMerge = this.getEmptyCellsBetween(cellFrom, cellTo);
    return cellFrom.merge(cellsToMerge);
  }
  /**
   *
   * @param {object} coord
   */


  mouseInCell(coord) {
    if (!this.contextMenu.isVisible()) {
      this.cellsEach(cell => cell.mouseOut());
      this.schedule.hideTooltip();
      let cell = this.getCellByCoord(coord, false);

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


  highlightSelections(cell) {
    this.selections.forEach(selection => selection.highlight());
  }
  /**
   * Remove all highlight of cell.
   */


  removeHighlights() {
    this.highlights.clear();
  }

  setSelection(selection) {
    this.currentSelection = selection;
  }

  addSelection(selection) {
    this.selections.push(selection);
  }

  clearSelection() {
    this.selections.forEach(selection => selection.deselect());
    this.selections = [];
  }

  getSelections() {
    return this.selections;
  }

  finishSelection() {
    const {
      currentSelection,
      selections
    } = this;

    if (currentSelection) {
      let numberOfBatchedCells = 0;
      this.highlightSelections();
      currentSelection.finish();
      const selectedItems = [];
      this.selections.forEach(selection => selection.batchedCells.forEach(cell => {
        selectedItems.push({
          data: cell.data,
          timeRange: cell.timeRange.map(t => t.format('YYYY-MM-DD HH:mm:ss'))
        });
        numberOfBatchedCells++;
      }));
      numberOfBatchedCells > 1 ? this.schedule.container.classList.add('schedule-multi-select') : this.schedule.container.classList.remove('schedule-multi-select');
      this.schedule.emit(events$1.SELECTE, selectedItems);
      const currentCell = currentSelection.getCell();

      if (currentCell.data && currentCell.data.liveTime && currentCell.timeRange.some((t, idx) => !t.isSame(currentCell.data.liveTime[idx]))) {
        this.schedule.emit(events$1.TIME_RANGE_CHANGE, formatTimeRange(currentCell.timeRange, 'YYYY-MM-DD HH:mm:ss'));
      }
    }
  }

  showContextMenu(coord) {
    if (this.currentSelection) {
      const cell = this.currentSelection.getCell();

      if (cell.hasData(true)) {
        this.tooltip.hide();
        this.contextMenu.show(coord);
      }
    }
  }

}

/**
 * @class {BaseRender}
 */
class BaseRender {
  constructor() {
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


  setRenderer(draw) {
    this.draw = draw;
  }
  /**
   * Set the table instance.
   * @param {Table} table Table instance.
   */


  setTable(table) {
    this.table = table;
  }

}

/**
 * @class {Cell}
 */

class Cell extends BaseRender {
  constructor({
    colIdx,
    rowIdx,
    label,
    parent,
    dashLine
  }) {
    super();
    this.colIdx = colIdx;
    this.rowIdx = rowIdx;
    this.label = label;
    this.parent = parent;
    this.borderWidth = 1;
    this.borderTop = 1;
    this.borderRight = 1;
    this.borderBottom = 1;
    this.borderLeft = 1;
    this.dashLine = dashLine;
    this.mergedCells = [this];
    this.setTable(parent.table);
    this.setRenderer(parent.draw);
    this.table = parent.table;
    this.timeRange = null;
    this.setTimeRange();
    this.init();
    /**
     * Width of cell.
     * @type {number}
     */

    this.width = 0;
    /**
     * Height of cell.
     * @type {number}
     */

    this.height = 0;
  }

  init() {
    this.selected = false;
    this.hovering = false;
    this.__actualCell = this;
    this.data = null;
  }

  getCell() {
    return this.__actualCell;
  }

  getColor() {
    const {
      cellSelectedColor,
      bgColor,
      cellActiveColor,
      cellCrossColAlpha
    } = this.table.settings;
    let cellColor = this.selected || this.hovering ? cellSelectedColor : bgColor;

    if (this.data) {
      cellColor = this.getDataValue('color') || cellActiveColor;
    }

    if (this.isCrossCol()) {
      cellColor = this.getCell().getColor() + getHexAlpha(cellCrossColAlpha);
    } else if (this.getCell() !== this) {
      cellColor = null;
    }

    return cellColor;
  }

  isCrossCol() {
    const _cell = this.getCell();

    return _cell !== this && this.rowIdx === 0 && this.colIdx !== _cell.colIdx;
  }

  getIcon() {
    return this.getDataValue('icon');
  }

  getTexts() {
    return this.getDataValue('texts');
  }

  setTimeRange() {
    const {
      timeScale,
      yearMonth
    } = this.table.settings;
    const timeFrom = yearMonth.add(this.rowIdx * 60 * timeScale + this.colIdx * 24 * 60, 'minute');
    const timeTo = timeFrom.add(this.getRowSpan() * 60 * timeScale, 'minute');
    this.timeRange = [timeFrom, timeTo];
  }

  getCoords(isCenter) {
    const {
      cellWidth,
      cellHeight
    } = this.parent;
    const x = this.colIdx * cellWidth + this.parent.startingCoords.x + (isCenter ? this.width / 2 : 0);
    const y = this.rowIdx * cellHeight + this.parent.startingCoords.y + (isCenter ? this.height / 2 : 0);
    return {
      x,
      y
    };
  }

  getDataValue(key, data = this.data) {
    const {
      renderCell,
      dataMaps
    } = this.table.settings;
    key = this.table.settings[`${key}Key`];

    if (typeof renderCell === 'function') {
      const obj = renderCell(data);
      return obj ? obj[key] : null;
    }

    if (!data) {
      return null;
    }

    let map;

    if (dataMaps) {
      map = dataMaps[key];
    }

    if (map) {
      const obj = map.find(o => o.key === data[key]);
      return obj ? obj.value : null;
    }

    return data[key];
  }

  getHighlightConfigs() {
    const {
      cellWidth
    } = this.parent;
    const cellHeight = this.getColHeight(false);
    const {
      cellBorderWidth
    } = this.table.settings;
    const mergedCells = this.getMergedCells();
    let colIdx = null;
    let i = -1;
    const cellsGroup = [];
    mergedCells.forEach(cell => {
      if (colIdx === null || cell.colIdx !== colIdx) {
        cellsGroup.push([]);
        colIdx = cell.colIdx;
        i++;
      }

      cellsGroup[i].push(cell);
    });
    return cellsGroup.map(cells => ({
      width: cellWidth - cellBorderWidth,
      height: cells.length * cellHeight - cellBorderWidth,
      coords: cells[0].getCoords()
    }));
  }

  getMergedCells() {
    return this.mergedCells;
  }

  renderRect(cellColor) {
    const {
      data,
      rowIdx
    } = this;
    const {
      cellWidth
    } = this.parent;
    const {
      cellBorderWidth,
      cellSelectedColor,
      cellActiveColor,
      cellBorderColor,
      bgColor,
      colorKey,
      iconKey,
      textsKey
    } = this.table.settings;
    this.width = cellWidth - cellBorderWidth;
    this.height = this.getColHeight(true) - cellBorderWidth;
    this.draw.rect({ ...this.getCoords(),
      width: this.width,
      height: this.height,
      fill: cellColor,
      borderColor: cellBorderColor,
      borderWidth: cellBorderWidth,
      ...(this.dashLine && !this.hasData() ? {
        borderTop: rowIdx % (1 / 0.5) !== 0 ? 'dash' : true,
        borderBottom: rowIdx % (1 / 0.5) === 0 ? 'dash' : true
      } : {})
    });
  }

  render() {
    if (this.hidden) {
      return;
    }

    const {
      bgColor
    } = this.table.settings;
    const cellColor = this.getColor();

    if (!cellColor) {
      return;
    } // Fill background color if color has alpha.


    if (hexHasAlpha(cellColor)) {
      this.renderRect(bgColor);
    }

    this.renderRect(cellColor);

    if (this.data) {
      this.renderIconAndTexts(this.getIcon(), this.getTexts());
    }

    this.renderLabel(this.label);
  }

  renderLabel(label) {
    if (typeof label !== 'string') {
      return;
    }

    const {
      x,
      y
    } = this.getCoords(true);
    this.draw.text({
      text: label,
      x,
      y,
      fill: this.table.settings.headerTextColor
    });
  }

  renderIconAndTexts(icon, texts) {
    let {
      x,
      y
    } = this.getCoords(true);

    if (texts || icon) {
      const {
        fontSize,
        fontColor,
        lineHeight,
        iconMaxWidth
      } = this.table.settings;
      const imgPadding = 5;
      const imgSize = Math.min(this.width - imgPadding, iconMaxWidth);
      let maxNumberOfLines = 0;

      if (this.height < imgSize + lineHeight) {
        if (texts || this.height < imgSize + imgPadding) {
          icon = null;
          maxNumberOfLines = 1;
        }
      } else if (texts) {
        maxNumberOfLines = Math.min(texts.length, Math.floor((this.height - (icon ? imgSize : 0)) / lineHeight));
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
        y += imgPadding + lineHeight;
      }

      if (texts) {
        const maxFontLength = this.width / parseInt(fontSize) + 1;
        texts.forEach(text => {
          this.draw.text({
            text: String(text).slice(0, maxFontLength),
            x,
            y,
            fill: fontColor
          });
          y += lineHeight;
        });
      }
    }
  }

  setData(callback) {
    if (this.selected && this.isVisible()) {
      if (!this.data) {
        const {
          timeRangeKey
        } = this.table.settings;
        this.data = {
          [timeRangeKey]: this.timeRange
        };
      }

      let data = { ...this.data,
        ...(callback || {})
      };

      if (typeof callback === 'function') {
        data = callback(cell.data || {});
      }

      const {
        colorKey,
        iconKey,
        textsKey
      } = this.table.settings;
      const oriData = { ...this.data
      };
      this.data = data;
      this.renderIfPropsChanged({
        [colorKey]: this.getDataValue('color', data),
        [iconKey]: this.getDataValue('icon', data),
        [textsKey]: this.getDataValue('texts', data)
      }, oriData);
      return true;
    }

    return false;
  }

  mouseIn() {
    !this.hasData() && this.renderIfPropsChanged({
      hovering: true
    });
    return this;
  }

  mouseOut() {
    !this.hasData() && this.renderIfPropsChanged({
      hovering: false
    });
    return this;
  }

  select() {
    if (this.hasData()) {
      this.selected = true;
    } else {
      this.renderIfPropsChanged({
        selected: true
      });
    }

    return this;
  }

  deselect() {
    if (this.hasData()) {
      this.selected = false;
    } else {
      this.mergedCells.forEach(cell => cell.clear());
    }

    return this;
  }

  renderIfPropsChanged(props, data = this) {
    if (this.getCell() !== this && !this.isCrossCol()) {
      return this.getCell().renderIfPropsChanged(props);
    }

    let hasChaned = false;
    Object.keys(props).forEach(prop => {
      if (props[prop] !== data[prop]) {
        data[prop] = props[prop];
        hasChaned = true;
      }
    });

    if (hasChaned) {
      this.renderMerged();
    }

    return hasChaned;
  }

  renderMerged() {
    this.render();
    this.mergedCells.forEach(cell => cell.isCrossCol() && cell.render());
  }

  cloneFrom(cell) {
    this.selected = cell.selected;
    this.data = cell.data;
    return this;
  }

  merge(cellsToMerge) {
    const actualCell = cellsToMerge[0];

    if (actualCell !== this) {
      return;
    }

    const oriMergedCells = this.__actualCell.mergedCells;
    const cellsToRender = [];
    [...oriMergedCells, ...cellsToMerge].filter(cell => cell !== actualCell).forEach(cell => {
      if (!cellsToRender.find(c => c.isSamePosition(cell))) {
        cell.init();
        cell.unMerge();
        cellsToRender.push(cell);
      }

      if (cellsToMerge.includes(cell)) {
        cell.__actualCell = actualCell;
      }
    });
    actualCell.mergedCells = [...cellsToMerge];
    actualCell.__actualCell = actualCell;
    cellsToRender.push(actualCell);
    cellsToRender.forEach(cell => cell.render());
    actualCell.setTimeRange();
    return actualCell;
  }

  unMerge() {
    this.mergedCells = [this];
    this.setTimeRange();
    return this;
  }

  getColHeight(includesMerged) {
    const cellHeight = this.parent.cellHeight;

    const _cell = this.isCrossCol() ? this.getCell() : this;

    return includesMerged ? _cell.mergedCells.filter(cell => cell.colIdx === this.colIdx).length * cellHeight : cellHeight;
  }

  getRowSpan() {
    return this.mergedCells.length;
  }

  getRowIdxOfLastCell() {
    const mergedCells = this.getMergedCells();
    return mergedCells[mergedCells.length - 1].rowIdx;
  }

  clear() {
    this.mergedCells.forEach(cell => {
      cell.init();
      cell.render();
    });
    this.mergedCells[0].unMerge();
  }

  delete() {
    this.deselect();
    this.clear();
  }

  isBefore(cell) {
    return this.colIdx === cell.colIdx ? this.rowIdx < cell.rowIdx : this.colIdx < cell.colIdx;
  }

  isSame(cell) {
    return this.getCell() === cell.getCell();
  }

  isSamePosition(cell) {
    return this.colIdx === cell.colIdx && this.rowIdx === cell.rowIdx;
  }

  isVisible() {
    return this.__actualCell === this;
  }

  isSelected() {
    return this.getCell().selected;
  }

  hasData(includesMerged) {
    return includesMerged ? !!this.getCell().data : !!this.data;
  }

}
Object.assign(Cell.prototype, eventMixin);

/**
 * Cells rederer.
 * @class {Table}
 */

class Cells extends BaseRender {
  constructor() {
    super();
    /**
     * Array containing a list of cell.
     *
     * @private
     * @type {Array}
     */

    this._cells = [];
    /**
     * Reference to the starting coords of cell.
     */

    this.startingCoords = {
      x: 0,
      y: 0
    };
  }

  init() {
    const {
      numberOfCols,
      numberOfRows,
      timeScale
    } = this.table.settings;
    const {
      cellWidth,
      cellHeight
    } = this.table;

    for (let colIdx = 0; colIdx < numberOfCols; colIdx++) {
      this._cells[colIdx] = [];

      for (let rowIdx = 0; rowIdx < numberOfRows / timeScale; rowIdx++) {
        const cell = new Cell({
          colIdx,
          rowIdx,
          parent: this,
          dashLine: true
        });

        if (rowIdx === 0 && colIdx === 0) {
          cell.colSpan = 2;
        }

        this._cells[colIdx].push(cell);
      }
    }
  }

  refresh() {
    this.cellGroupsEach(cell => !cell.selected && cell.clear());
    this.render();
  }

  adjust() {
    const {
      colHeaderWidth,
      rowHeaderHeight,
      cellBorderWidth
    } = this.table.settings;
    const {
      cellWidth,
      cellHeight
    } = this.table;
    this.startingCoords = {
      x: colHeaderWidth + cellBorderWidth,
      y: rowHeaderHeight + cellBorderWidth
    };
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
  }

  render(items) {
    if (!this._cells.length) this.init();
    this.adjust();
    items = this.table.sort(items || this.table.items);
    let item = items.shift();
    let cellsToMerge;
    this.cellsEach(cell => {
      if (item && cell.colIdx === item.colIdx && cell.rowIdx === item.rowIdx) {
        cell.data = item.data;
        cellsToMerge = this.table.getCellsBetween(cell, this.getCell(cell.colIdx, cell.rowIdx + item.rowSpan));
        cell.merge(cellsToMerge);
        item = items.shift();
      } else {
        cell.render();
      }
    });
  }

  cellsEach(cb, {
    cellFrom,
    cellTo,
    rowSpan,
    reverse
  } = {}) {
    const {
      _cells
    } = this;
    let colIdx = 0;
    let rowIdx = 0;

    if (cellFrom) {
      colIdx = cellFrom.colIdx;
      rowIdx = cellFrom.rowIdx;
    } else if (reverse) {
      const {
        settings
      } = this.table;
      colIdx = settings.numberOfCols.length - 1;
      rowIdx = settings.numberOfRows.length - 1;
    }

    let colCells = _cells[colIdx];
    let curRowSpan = 0;
    let stop = false;

    while (!stop && colCells) {
      const cell = colCells[rowIdx];

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


  cellGroupsEach(cb, config) {
    return this.cellsEach(cell => {
      cell.isVisible() && cb(cell);
      return true;
    }, config);
  }

  getCells() {
    return this._cells;
  }
  /**
   * Get cell specified by index of column and index of row.
   * @param {number} colIdx Index of col.
   * @param {number} rowIdx  Index of row.
   * @param {boolean} crossCol Cross col when col index bigger than max col idx.
   */


  getCell(colIdx, rowIdx, crossCol = true) {
    try {
      if (crossCol) {
        const numberOfRows = this.table.settings.numberOfRows / this.table.settings.timeScale;

        if (rowIdx > numberOfRows - 1 || rowIdx < 0) {
          const _numberOfRows = colIdx * numberOfRows + rowIdx;

          colIdx = Math.floor(_numberOfRows / numberOfRows);
          rowIdx = _numberOfRows % numberOfRows;
        }
      }

      return this.getCells()[colIdx][rowIdx] || null;
    } catch (error) {
      return null;
    }
  }

}

/**
 * Table render and managing.
 * @class {RowHeader}
 */

class RowHeader extends BaseRender {
  constructor() {
    super();
    this._cells = [];
    /**
     * Reference to the starting coords of cell.
     */

    this.startingCoords = {
      x: 0,
      y: 0
    };
  }

  init() {
    for (let colIdx = 0; colIdx < this.table.settings.numberOfCols; colIdx++) {
      this._cells[colIdx] = [];
      const cell = new Cell({
        colIdx,
        rowIdx: 0,
        label: String(colIdx + 1),
        parent: this
      });
      cell.setRenderer(this.draw);
      cell.setTable(this.table);
      this._cells[colIdx] = cell;
    }
  }

  adjust() {
    const {
      cellWidth,
      cellHeight
    } = this.table;
    const {
      colHeaderWidth,
      cellBorderWidth,
      rowHeaderHeight
    } = this.table.settings;
    this.cellWidth = cellWidth;
    this.cellHeight = rowHeaderHeight;
    this.startingCoords = {
      x: colHeaderWidth + cellBorderWidth,
      y: cellBorderWidth
    };
  }

  render() {
    if (!this._cells.length) this.init();
    this.adjust();

    this._cells.forEach(cell => cell.render());
  }

}

/**
 * Table render and managing.
 * @class {rederer}
 */

class ColHeader extends BaseRender {
  constructor() {
    super();
    this._cells = [];
    /**
     * Reference to the starting coords of cell.
     */

    this.startingCoords = {
      x: 0,
      y: 0
    };
  }

  init() {
    for (let rowIdx = 0; rowIdx < this.table.settings.numberOfRows + 1; rowIdx++) {
      this._cells[rowIdx] = [];
      const cell = new Cell({
        colIdx: 0,
        rowIdx,
        label: rowIdx === 0 ? '' : `${rowIdx - 1}-${rowIdx}`,
        parent: this
      });
      cell.setRenderer(this.draw);
      cell.setTable(this.table);
      this._cells[rowIdx] = cell;
    }
  }

  renderCornerLeft() {
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
    const {
      cellBorderColor,
      cellBorderWidth
    } = this.table.settings;
    this.draw.ctx.save();
    this.draw.ctx.strokeStyle = cellBorderColor;
    this.draw.ctx.lineWidth = cellBorderWidth;
    this.draw.ctx.beginPath();
    this.draw.ctx.moveTo(0, 0);
    this.draw.ctx.lineTo(this.cellWidth, this.cellHeight);
    this.draw.ctx.stroke();
    this.draw.ctx.restore();
  }

  adjust() {
    const {
      cellHeight,
      settings
    } = this.table;
    const {
      cellBorderWidth,
      colHeaderWidth,
      timeScale
    } = settings;
    this.startingCoords = {
      x: cellBorderWidth,
      y: cellBorderWidth
    };
    this.cellWidth = colHeaderWidth;
    this.cellHeight = cellHeight / timeScale;
  }

  render() {
    if (!this._cells.length) this.init();
    this.adjust();

    this._cells.forEach(cell => cell.render());

    this.renderCornerLeft();
  }

}

const HIGHLIGHT_CLASS = 'schedule-highlight';
const HIGHLIGHT_UP_RESIZE_CLASS = 'schedule-highlight-up-resize';
const HIGHLIGHT_DOWN_RESIZE_CLASS = 'schedule-highlight-down-resize';
const HIGHLIGHT_DISABLED_UP_RESIZE = 'disabled-up-resize';
const HIGHLIGHT_DISABLED_DOWN_RESIZE = 'disabled-down-resize';
/**
 * @class {Highlights}
 */

class Highlights {
  constructor(rootNode, onResize) {
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

  clearHighlights(highlightGroup) {
    highlightGroup._members.forEach(highlight => {
      highlight.style.visibility = 'hidden';
    });

    highlightGroup.cell = null;
  }
  /**
   * @returns {HTMLElement}
   */


  createNew() {
    const highlightGroup = {
      _members: [],
      cell: null
    };

    this._highlightList.push(highlightGroup);

    return highlightGroup;
  }

  createHighlight(highlightGroup) {
    const highlight = document.createElement('div');
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
  }

  getCoords(event) {
    const {
      left,
      top
    } = this.rootNode.getBoundingClientRect();
    return {
      x: event.clientX - left,
      y: event.clientY - top
    };
  }

  adjust(highlightGroup) {
    const {
      cell
    } = highlightGroup;
    const configs = cell.getHighlightConfigs();
    const nuhmberOfHighlights = configs.length;
    configs.forEach((config, idx) => {
      const {
        coords,
        width,
        height
      } = config;
      const highlight = highlightGroup._members[idx] || this.createHighlight(highlightGroup);
      highlight.className = HIGHLIGHT_CLASS;
      highlight.style.transform = `translate3d(${coords.x}px, ${coords.y}px, 0)`;
      highlight.style.width = `${width}px`;
      highlight.style.height = `${height}px`;
      highlight.style.visibility = 'visible';
    });

    if (nuhmberOfHighlights > 1) {
      highlightGroup._members[0].classList.add(HIGHLIGHT_DISABLED_DOWN_RESIZE);

      highlightGroup._members[nuhmberOfHighlights - 1].classList.add(HIGHLIGHT_DISABLED_UP_RESIZE);

      highlightGroup._members.slice(1, nuhmberOfHighlights - 1).forEach(h => h.classList.add(HIGHLIGHT_DISABLED_DOWN_RESIZE, HIGHLIGHT_DISABLED_UP_RESIZE));
    }
  }

  adjustAll() {
    this._highlightList.forEach(highlightGroup => {
      if (highlightGroup.cell) {
        this.adjust(highlightGroup);
      }
    });
  }
  /**
   * Show the cell highlight.
   * @param {Cell} cell
   */


  show(cell) {
    let highlightGroup = this._highlightList.find(h => !h.cell);

    if (!highlightGroup) {
      highlightGroup = this.createNew();
    }

    highlightGroup.cell = cell;
    this.adjust(highlightGroup);
  }

  clear() {
    this._highlightList.forEach(highlightGroup => this.clearHighlights(highlightGroup));
  }

}

class Tooltip {
  constructor(container, color) {
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
      color,
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


  show(config) {
    this.tooltip.style.visibility = 'visible';
    this.refresh(config);
  }
  /**
   *
   * @param {object||Function} callback
   */


  refresh(callback) {
    const {
      color,
      text,
      icon,
      x,
      y
    } = typeof callback === 'function' ? callback(this._config) : callback;
    this.showIcon(icon);
    this.setBackgroundColor(color);
    this.setText(text);
    const distanceToCol = 3;
    this.tooltip.style.transform = `translate3d(${x + distanceToCol}px, ${y}px, 0)`;
  }

  setBackgroundColor(color) {
    this._config.color = color || this._color;
    this.tooltip.style.backgroundColor = this._config.color;
  }

  showIcon(icon) {
    this._config.icon = icon || null;
    this.icon.style.display = this._config.icon ? 'block' : 'none';

    if (this._config.icon) {
      this.icon.src = this._config.icon;
    }
  }

  setText(text) {
    this._config.text = text;
    this.text.innerHTML = this._config.text;
  }

  hide() {
    this.tooltip.style.visibility = 'hidden';
  }

}

/**
 * Manage cell selection.
 * @class {Selction}
 */

class Section {
  constructor(schedule, cell) {
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

  selectMultiCol(colIdx, rowIdx) {
    const _batchedCells = [...this.batchedCells];
    this.batchedCells = [];
    const cellsToMergedList = [];
    const stopedCellConfig = {
      colIdx,
      rowIdx
    };
    numberEach(idx => {
      const cellsToMerged = this.adjust(idx, rowIdx);

      if (idx !== this.colFrom && this.colMeetData(cellsToMerged)) {
        stopedCellConfig.colIdx = idx;
        return false;
      }

      if (cellsToMerged.length) {
        cellsToMergedList.push(cellsToMerged);
        arrayRemoveItem(_batchedCells, cell => cellsToMerged.some(c => c.colIdx === cell.getCell().colIdx));
      }
    }, this.colFrom, colIdx);
    const maxNumberOfMerge = cellsToMergedList.reduce((prev, current) => Math.min(prev, current.length), cellsToMergedList[0].length);
    cellsToMergedList.forEach(cellsToMerged => {
      const reverse = this.rowFrom > rowIdx;
      cellsToMerged = reverse ? cellsToMerged.reverse().slice(0, maxNumberOfMerge).reverse() : cellsToMerged.slice(0, maxNumberOfMerge);
      const mergedCell = this.mergeRow(cellsToMerged);
      this.setCell(mergedCell);
      this.batchedCells.push(mergedCell);
      stopedCellConfig.rowIdx = cellsToMerged[0].rowIdx;
    });

    _batchedCells.forEach(cell => cell.getCell().deselect());

    this.schedule.showTooltip(this.table.getCell(stopedCellConfig.colIdx, stopedCellConfig.rowIdx));
  }

  move(colIdx, rowIdx) {
    this.table.removeHighlights();
    const {
      numberOfRows
    } = this.table.settings;
    const cellsToMerged = this.adjust(this.colFrom, rowIdx + (colIdx - this.colFrom) * numberOfRows);
    this.mergeRow(cellsToMerged);
  }

  cutCells(cells, length) {
    if (cells.length === 1) {
      return cells;
    }

    return cells[0].rowIdx > cells[1].rowIdx ? cells.reverse().slice(0, length).reverse() : cells.slice(0, length);
  }

  mergeRow(cellToMerged) {
    const currentCell = this.cell.getCell();
    return cellToMerged[0].cloneFrom(currentCell).merge(cellToMerged);
  }

  colMeetData(cells) {
    return !cells.length || cells.some(cell => cell.getCell().hasData());
  }

  getEmptyCellsAtCol(colFrom, rowFrom, rowTo) {
    const emptyColCells = [];
    const currentCell = this.cell;
    numberEach(idx => {
      const cell = this.table.getCell(colFrom, idx);

      if (cell) {
        if (!currentCell.isSame(cell) && cell.getCell().hasData()) {
          return false;
        }

        emptyColCells.push(cell);
      }
    }, rowFrom, rowTo);
    return rowFrom > rowTo ? emptyColCells.reverse() : emptyColCells;
  }

  adjust(colIdx, rowIdx) {
    if (!this.positionOfAdjustment && !this.cell.hasData()) {
      return this.getEmptyCellsAtCol(colIdx, this.rowFrom, rowIdx);
    } else if (this.positionOfAdjustment === 'down') {
      return this.getEmptyCellsAtCol(this.colFrom, this.rowFrom, Math.max(this.rowFrom, rowIdx - this.rowIdxOfLastCell + this.rowFrom + this.rowSpan - 1));
    } else if (this.positionOfAdjustment === 'up') {
      const rowTo = this.rowFrom + this.rowSpan - 1;
      return this.getEmptyCellsAtCol(this.colFrom, rowTo, Math.min(rowTo, rowIdx));
    }
  }
  /**
   *
   * @param {Cell} cell
   */


  setCell(cell) {
    this.cell = cell.getCell().select();
  }
  /**
   * @returns {Cell} cell
   */


  getCell() {
    return this.cell;
  }
  /**
   * Indicate that selection procell began.
   */


  begin(cell, positionOfAdjustment) {
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


  finish() {
    this.currentCell = null;
    this.inProgress = false;
    this.positionOfAdjustment = null;
  }
  /**
   * Check if the process of selecting the cell/cells is in progress.
   */


  isInProgress() {
    return this.inProgress;
  }
  /**
   * Deselect all cells.
   * @param {boolean} includesDataSelection
   */


  deselect(includesDataSelection) {
    this.table.removeHighlights();
    this.batchedCells.forEach(cell => cell.getCell().deselect());
  }

  highlight() {
    this.batchedCells = this.batchedCells.filter(cell => {
      if (cell.selected) {
        this.table.highlights.show(cell.getCell());
        return true;
      }

      return false;
    });
  }

  deleteCell(cell) {
    const selectedCell = this.getCell();
    const cellToDelete = cell || selectedCell;

    if (cellToDelete.isSame(selectedCell)) {
      this.deselect();
    }

    cellToDelete.delete();
  }

}

var keycode = createCommonjsModule(function (module, exports) {
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

class Events {
  constructor(schedule) {
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
    const {
      readOnly
    } = this.table.settings;

    if (!readOnly) {
      this.container.addEventListener('mousedown', this.onMouseDown);
      window.addEventListener('mouseup', this.onMouseUp);
      this.container.addEventListener('contextmenu', this.onContextMenu);
      document.addEventListener('keydown', this.onKeydown);
    }

    window.addEventListener('mousemove', this.onMouseMove);
    this.table.contextMenu.onContextMenuItemSelect(this.onContextMenuItemSelect);
  }

  addResizeListener(el, cb) {
    const ro = new ResizeObserver((entries, _) => {
      const {
        width,
        height
      } = entries[0].contentRect;
      cb(width, height);
    });
    ro.observe(el);
  }
  /**
   * @private
   */


  addEventListener() {}
  /**
   *
   */


  onMouseDown(event) {
    event.preventDefault();

    if (event.target.classList.contains(CONTEXTMENU_ITEM_CLASS)) {
      return;
    }

    const coord = this.getCoords(event);
    const cell = this.table.getCellByCoord(coord);
    const {
      currentSelection
    } = this.table;

    if (event.target.classList.contains(HIGHLIGHT_DOWN_RESIZE_CLASS)) {
      return currentSelection.begin(null, 'down');
    }

    if (event.target.classList.contains(HIGHLIGHT_UP_RESIZE_CLASS)) {
      return currentSelection.begin(null, 'up');
    }

    if (event.shiftKey) {
      const colIdx = this.table.getColIdx(coord.x);
      const rowIdx = this.table.getRowIdx(coord.y);
      return currentSelection.move(colIdx, rowIdx);
    }

    if (!event.ctrlKey && !event.metaKey) {
      this.table.clearSelection();
    }

    if (cell && !cell.isSelected()) {
      const _currentSelection = new Section(this.schedule, cell);

      _currentSelection.begin(cell);

      this.table.setSelection(_currentSelection);
      this.table.addSelection(_currentSelection);
    }
  }
  /**
   *
   */


  onMouseUp() {
    event.preventDefault();
    this.table.finishSelection();
  }
  /**
   *
   */


  onMouseMove(event) {
    event.preventDefault();
    const coord = this.getCoords(event);
    const cell = this.table.getCellByCoord(coord);
    const {
      currentSelection
    } = this.table;

    if (currentSelection && currentSelection.isInProgress()) {
      const colIdx = this.table.getColIdx(coord.x);
      const rowIdx = this.table.getRowIdx(coord.y);
      currentSelection.selectMultiCol(colIdx, rowIdx);
    } else {
      this.table.mouseInCell(coord);
    }
  }
  /**
   *
   */


  onResize() {}
  /**
   *
   */


  onContextMenu(event) {
    event.preventDefault();
    this.table.showContextMenu(this.getCoords(event));
  }

  onContextMenuItemSelect(action, item) {
    const {
      currentSelection
    } = this.table;

    if (currentSelection && action) {
      const hasBindEvent = this.schedule.emit(events$1.CONTEXT_MENU_ITEM_SELECT, action, this.schedule, currentSelection.getCell().data, item);

      if (!hasBindEvent && action === 'delete') {
        currentSelection.deleteCell();
      }
    }
  }

  onKeydown(event) {
    if (keycode(event) === 'backspace') {
      this.table.currentSelection.deleteCell();
    }
  }
  /**
   *
   */


  clear() {
    this.container.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('mousemove', this.onMouseMove);
    this.container.removeEventListener('contextmenu', this.onContextMenu);
    document.removeEventListener('keydown', this.onKeydown);
  }

  getCoords(event) {
    const {
      left,
      top
    } = this.canvas.getBoundingClientRect();
    return {
      x: event.clientX - left,
      y: event.clientY - top
    };
  }

}

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
var settingsFactory = (() => {
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
    renderTooltip: () => {},

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

var css_248z = ".schedule-canvas-container {\n  position: relative;\n}";
styleInject(css_248z);

var css_248z$1 = ".schedule-highlight {\n  position: absolute;\n  top: 0;\n  left: 0;\n  border: 2px solid #999999;\n  pointer-events: none;\n  margin: -2px;\n  visibility: hidden;\n}\n\n.schedule-highlight-up-resize {\n  position: absolute;\n  width: 100%;\n  height: 8px;\n  top: -2px;\n  left: 0;\n  cursor: row-resize;\n  pointer-events: all;\n}\n\n.schedule-highlight-down-resize {\n  position: absolute;\n  width: 100%;\n  height: 8px;\n  bottom: -2px;\n  left: 0;\n  cursor: row-resize;\n  pointer-events: all;\n}\n\n.schedule-highlight.disabled-up-resize {\n  border-top-style: dotted;\n}\n\n.schedule-highlight.disabled-up-resize .schedule-highlight-up-resize {\n  pointer-events: none;\n}\n\n.schedule-highlight.disabled-down-resize {\n  border-bottom-style: dotted;\n}\n\n.schedule-highlight.disabled-down-resize .schedule-highlight-down-resize {\n  pointer-events: none;\n}\n\n.schedule-multi-select .schedule-highlight-up-resize, \n.schedule-multi-select .schedule-highlight-down-resize {\n  pointer-events: none;\n}";
styleInject(css_248z$1);

var css_248z$2 = ".schedule-contextmenu {\n  position: absolute;\n  left: 0;\n  top: 0;\n  padding: 5px 0;\n  margin: 0;\n  background: #707070;\n  border: 1px solid #707070;\n  border-radius: 4px;\n  box-shadow: 2px 2px 8px 0px rgba(150, 150, 150, 0.2);\n  list-style: none;\n  font-size: 14px;\n  white-space: nowrap;\n  cursor: pointer;\n  z-index: 2800;\n  -webkit-tap-highlight-color: transparent;\n}\n\n.schedule-contextmenu-item {\n  padding: 5px 14px;\n  line-height: 1;\n  color: #fff;\n}\n\n.schedule-contextmenu-item:hover {\n  background: #585858;\n}";
styleInject(css_248z$2);

var css_248z$3 = ".schedule-tooltip {\n  position: absolute;\n  left: 0;\n  top: 0;\n  line-height: 20px;\n  padding: 5px;\n  opacity: 0.9;\n  color: #ffffff;\n  font-size: 14px;\n  pointer-events: none;\n  border-radius: 4px;\n  white-space: nowrap;\n  z-index: 999;\n  background:#707070;\n  visibility: hidden;\n}\n.schedule-tooltip-icon {\n  width: 24px;\n  height: 24px;\n}\n.schedule-tooltip p {\n  margin: 0;\n  max-width: 200px;\n}";
styleInject(css_248z$3);

/**
 * Schedule.
 *
 * @class Schedule.
 */

class Schedule {
  /**
   *
   * @param {HTMLElement} rootNode The elment which the Schedule instance is injected.
   * @param {object} userSettings The user defined options.
   */
  constructor(rootNode, userSettings) {
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
    this.settings = { ...this.defaultSettings,
      ...this.userSettings
    };
    this.settings.contextMenuItems = this.combineContextMenuItems(userSettings.contextMenuItems || [], [{
      action: 'delete',
      title: '删除'
    }]);
    this.settings.yearMonth = dayjs_min(userSettings.yearMonth);
    this.settings.numberOfCols = this.settings.yearMonth.daysInMonth();
    const items = this.getItemsFromData(this.settings.data); // Create table renderer for the schedule.

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


  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.container = document.createElement('div');
    this.container.className = 'schedule-canvas-container';
    this.container.appendChild(this.canvas);
    this.rootNode.appendChild(this.container);
  }

  render() {
    const {
      width,
      height
    } = this.rootNode.getBoundingClientRect();
    this.table.render(width, height);
    const ro = new ResizeObserver((entries, _) => {
      const {
        width,
        height
      } = entries[0].contentRect;
      this.table.resize(width, height);
    });
    ro.observe(this.rootNode);
  }

  combineContextMenuItems(...contextMenuItems) {
    const _contextMenuItems = [];
    contextMenuItems.reduce((previousValue, currentValue, _) => [...previousValue, ...currentValue], []).forEach(item => !_contextMenuItems.find(i => i.action === item.action) && _contextMenuItems.push(item));
    return _contextMenuItems;
  }

  setData(data) {
    const items = this.getItemsFromData(data);
    const oldItem = this.getItemsFromData(this.getData());
    this.table.setItems(items, oldItem);
  }

  setDataAtSelectedCell(callback) {
    this.table.cellsEach(cell => {
      cell.setData(callback);
    });
  }

  getItemsFromData(data) {
    const {
      timeRangeKey,
      timeScale
    } = this.settings;
    return data.map(live => {
      const [startTime, endTime] = live[timeRangeKey];
      const time = dayjs_min(startTime);
      const colIdx = time.date() - 1;
      const rowIdx = (time.hour() * 60 + time.minute()) / 60 / timeScale;
      const minutes = Math.abs(time.diff(endTime, 'minute'));
      const rowSpan = minutes / (timeScale * 60) - 1;
      return {
        colIdx,
        rowIdx,
        rowSpan,
        data: live
      };
    });
  }

  getData() {
    const data = [];
    this.table.cellGroupsEach(cell => {
      if (cell.hasData()) {
        data.push(cell.data);
      }
    });
    return data;
  }

  exportData() {}

  getCellTimeStr(cell) {
    return `${cell.colIdx + 1}, ${cell.timeRange.map(t => t.format('HH:mm')).join('~')}`;
  }
  /**
   *
   * @param {*} cell
   */


  getTooltipConfig(cell) {
    const {
      x,
      y
    } = cell.getCoords();
    const {
      renderTooltip
    } = this.settings;
    const tooltipText = cell.data && renderTooltip ? renderTooltip(cell.data) : '';
    return {
      x: x + cell.width,
      y,
      text: `<p>${this.getCellTimeStr(cell)}</p>${tooltipText}`,
      color: cell.hasData() ? cell.getColor() : null,
      icon: cell.getIcon()
    };
  }

  hideTooltip() {
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


  showTooltip(cell) {
    if (!cell) {
      return;
    }

    const config = this.getTooltipConfig(cell);
    this.table.tooltip.show(config);
  }

  destroy() {
    if (this.events) {
      this.events.clear();
    }
  }

  deleteSelectedCell() {
    if (this.table.currentSelection) {
      this.table.currentSelection.deleteCell();
    }
  }

  getCanvas() {
    return this.canvas;
  }

}
Object.assign(Schedule.prototype, eventMixin);
Schedule.settingsFactory = settingsFactory;

//
var script = {
  name: 'Schedule',
  props: (() => {
    const props = {};
    const settings = Schedule.settingsFactory();
    Object.keys(settings).forEach(key => {
      props[key] = {
        default: settings[key]
      };
    });
    return props;
  })(),
  methods: {
    init() {
      this.schedule = new Schedule(this.$refs.schedule, this.$props || {});
      Object.values(events$1).forEach(eventName => this.schedule.on(eventName, (...args) => this.$emit(eventName, ...args)));
      this.$watch('data', data => {
        this.setData(data);
      });
    },

    setData(data) {
      this.schedule.setData(data);
    },

    setDataAtSelectedCell(...args) {
      return this.schedule.setDataAtSelectedCell(...args);
    },

    getCanvas() {
      return this.schedule.getCanvas();
    }

  },

  mounted() {
    this.init();
  },

  beforeDestroy() {
    this.schedule.destroy();
  }

};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier
/* server only */
, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
  if (typeof shadowMode !== 'boolean') {
    createInjectorSSR = createInjector;
    createInjector = shadowMode;
    shadowMode = false;
  } // Vue.extend constructor export interop.


  var options = typeof script === 'function' ? script.options : script; // render functions

  if (template && template.render) {
    options.render = template.render;
    options.staticRenderFns = template.staticRenderFns;
    options._compiled = true; // functional template

    if (isFunctionalTemplate) {
      options.functional = true;
    }
  } // scopedId


  if (scopeId) {
    options._scopeId = scopeId;
  }

  var hook;

  if (moduleIdentifier) {
    // server build
    hook = function hook(context) {
      // 2.3 injection
      context = context || // cached call
      this.$vnode && this.$vnode.ssrContext || // stateful
      this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext; // functional
      // 2.2 with runInNewContext: true

      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__;
      } // inject component styles


      if (style) {
        style.call(this, createInjectorSSR(context));
      } // register component module identifier for async chunk inference


      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier);
      }
    }; // used by ssr in case component is cached and beforeCreate
    // never gets called


    options._ssrRegister = hook;
  } else if (style) {
    hook = shadowMode ? function () {
      style.call(this, createInjectorShadow(this.$root.$options.shadowRoot));
    } : function (context) {
      style.call(this, createInjector(context));
    };
  }

  if (hook) {
    if (options.functional) {
      // register for functional component in vue file
      var originalRender = options.render;

      options.render = function renderWithStyleInjection(h, context) {
        hook.call(context);
        return originalRender(h, context);
      };
    } else {
      // inject component registration as beforeCreate hook
      var existing = options.beforeCreate;
      options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
    }
  }

  return script;
}

var normalizeComponent_1 = normalizeComponent;

var isOldIE = typeof navigator !== 'undefined' && /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
function createInjector(context) {
  return function (id, style) {
    return addStyle(id, style);
  };
}
var HEAD = document.head || document.getElementsByTagName('head')[0];
var styles = {};

function addStyle(id, css) {
  var group = isOldIE ? css.media || 'default' : id;
  var style = styles[group] || (styles[group] = {
    ids: new Set(),
    styles: []
  });

  if (!style.ids.has(id)) {
    style.ids.add(id);
    var code = css.source;

    if (css.map) {
      // https://developer.chrome.com/devtools/docs/javascript-debugging
      // this makes source maps inside style tags work properly in Chrome
      code += '\n/*# sourceURL=' + css.map.sources[0] + ' */'; // http://stackoverflow.com/a/26603875

      code += '\n/*# sourceMappingURL=data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) + ' */';
    }

    if (!style.element) {
      style.element = document.createElement('style');
      style.element.type = 'text/css';
      if (css.media) style.element.setAttribute('media', css.media);
      HEAD.appendChild(style.element);
    }

    if ('styleSheet' in style.element) {
      style.styles.push(code);
      style.element.styleSheet.cssText = style.styles.filter(Boolean).join('\n');
    } else {
      var index = style.ids.size - 1;
      var textNode = document.createTextNode(code);
      var nodes = style.element.childNodes;
      if (nodes[index]) style.element.removeChild(nodes[index]);
      if (nodes.length) style.element.insertBefore(textNode, nodes[index]);else style.element.appendChild(textNode);
    }
  }
}

var browser = createInjector;

/* script */
const __vue_script__ = script;

/* template */
var __vue_render__ = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { ref: "schedule", staticClass: "schedule" },
    [_vm._t("default")],
    2
  )
};
var __vue_staticRenderFns__ = [];
__vue_render__._withStripped = true;

  /* style */
  const __vue_inject_styles__ = function (inject) {
    if (!inject) return
    inject("data-v-d7f93434_0", { source: ".schedule[data-v-d7f93434] {\n  width: 100%;\n  height: 100%;\n}\n\n/*# sourceMappingURL=schedule.vue.map */", map: {"version":3,"sources":["/Users/vdorchan/Documents/www/MOLI/Projects/schedule/src/components/schedule.vue","schedule.vue"],"names":[],"mappings":"AA4DA;EACA,WAAA;EACA,YAAA;AC3DA;;AAEA,uCAAuC","file":"schedule.vue","sourcesContent":["<template>\n  <div\n    class=\"schedule\"\n    ref=\"schedule\"\n  >\n    <slot></slot>\n  </div>\n</template>\n\n<script>\nimport Schedule from '../index'\nimport { events } from '../mixins/event'\n\nexport default {\n  name: 'Schedule',\n  props: (() => {\n    const props = {}\n    const settings = Schedule.settingsFactory()\n    Object.keys(settings).forEach((key) => {\n      props[key] = {\n        default: settings[key],\n      }\n    })\n    return props\n  })(),\n\n  methods: {\n    init () {\n      this.schedule = new Schedule(this.$refs.schedule, this.$props || {})\n      Object.values(events).forEach(eventName => this.schedule.on(eventName, (...args) => this.$emit(eventName, ...args)))\n\n      this.$watch('data', data => {\n        this.setData(data)\n      })\n    },\n\n    setData (data) {\n      this.schedule.setData(data)\n    },\n\n    setDataAtSelectedCell (...args) {\n      return this.schedule.setDataAtSelectedCell(...args)\n    },\n\n    getCanvas () {\n      return this.schedule.getCanvas()\n    }\n  },\n\n  mounted () {\n    this.init()\n  },\n\n  beforeDestroy () {\n    this.schedule.destroy()\n  },\n}\n</script>\n\n<style lang=\"scss\" scoped>\n.schedule {\n  width: 100%;\n  height: 100%;\n}\n</style>",".schedule {\n  width: 100%;\n  height: 100%;\n}\n\n/*# sourceMappingURL=schedule.vue.map */"]}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__ = "data-v-d7f93434";
  /* module identifier */
  const __vue_module_identifier__ = undefined;
  /* functional template */
  const __vue_is_functional_template__ = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__ = /*#__PURE__*/normalizeComponent_1(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    false,
    browser,
    undefined,
    undefined
  );

export { __vue_component__ as Schedule };
