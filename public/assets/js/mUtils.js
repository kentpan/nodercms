/**
 * @file mUtils
 * @author panjian01@baidu.com
 */
/* eslint-disable */
import Model from '@/model/';
import {
    OS,
    isHaokan,
    isMiniVideo,
    isIOS,
    isAndroid,
    appVersion,
    isPC
} from './scheme/ua';
import {
    matrixApp
} from './scheme/matrix';
import schemeConfig from './scheme/config';
import URL from 'url';
const STORE = require('../store/').default;
import { wiseLoginShow } from './h5_login';
import './date.format';

export function safeHref(url = '', safe) {
    const originUrl = url || location.href.split('#')[0];
    const prefix = originUrl.split('?')[0];
    const safeApiParams = safe || STORE.state.safeApiParams || [];
    const safeArgs = getRestFulArgs(originUrl, safeApiParams);
    const safeUrl = prefix + '?' + parseParams(safeArgs);
    return safeUrl;
}
/**
 * 获取cookie
 * @param {String} name 
 */
export function getCookie(name) {
    const value = '; ' + document.cookie;
    const parts = value.split('; ' + escape(name) + '=');
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
    return '';
}
/**
 * 设置cookie
 * @param {String} name 
 * @param {any} value 
 * @param {Number} seconds 
 */
export function setCookie(name, value, seconds = 30 * 24 * 60 * 60 * 1000) {
    const exp = new Date();
    exp.setTime(exp.getTime() + seconds);
    document.cookie = escape(name) + '=' + escape(value) + ';path=/;expires=' + exp.toUTCString();
}
/**
 * 删除cookie
 * @param {String} name 
 */
export function delCookie(name) {
    const cval = getCookie(name);
    const exp = new Date();
    exp.setTime(exp.getTime() - 1);
    if (cval != null) {
        document.cookie = escape(name) + '=' + cval + ';path=/;expires=' + exp.toUTCString();
    }
}
/*
set: function (key, value, ttl_ms) {
    var data = {
        value: value,
        expirse: new Date(ttl_ms).getTime()
    };
    localStorage.setItem(key, JSON.stringify(data));
},
get: function (key) {
    var data = JSON.parse(localStorage.getItem(key));
    if (data !== null) {
        debugger
        if (data.expirse != null && data.expirse < new Date().getTime()) {
            localStorage.removeItem(key);
        } else {
            return data.value;
        }
    }
    return null;
}
 */

/**
 * 存储localStorage
 */
export function setStore(name, content, expiese) {
    if (!name) return;
    if (typeof content !== 'string') {
        content = JSON.stringify(content);
    }
    try {
        window.localStorage.setItem(name, content);
    } catch (err) {
        window.localStorage.clear();
        window.localStorage.setItem(name, content);
    }
}
/**
 * 获取localStorage
 */
export function getStore(name) {
    if (!name) return;
    return window.localStorage.getItem(name);
}
/**
 * 删除localStorage
 */
export function removeStore(name) {
    if (!name) return;
    window.localStorage.removeItem(name);
}
/**
 * 获取元素到顶部距离
 * @param {HTMLElement} dom 
 */
export function getElementTop(el) {
    let actualTop = el.offsetTop;
    let current = el.offsetParent;
    while (current !== null) {
        actualTop += current.offsetTop;
        current = current.offsetParent;
    }
    return actualTop;
};
/**
 * 获取元素大小，坐标
 * @param {HTMLElement} dom 
 */
export function getRect(dom) {
    let rect = dom && dom.getBoundingClientRect() || {};
    return rect;
}
/**
 * 解析unicode|enscape字符
 * @param {String} str 
 */

export function decodeUnicode(str = '') {
    if (!str) {
        return '';
    }
    // 替换特殊字符空格"$&,:;<=>?+-*/\.'!~`|[] \uxx => \u00xx
    str = str.replace(/%(25)?(20|21|22|24|26|27|28|29|2a|2b|2c|2d|2e|2f|3a|3b|3c|3d|3e|3f|5b|5c|5d|60|7c|7e)/gi, '\\u00$2').replace(/%(25)?/gi, '\\');
    const rs = str.replace(/\\u([a-z0-9]{4})/ig, (a, b) => {
        return String.fromCharCode(parseInt(b, 16));
    });
    return rs;
}
/**
 * 时间转换
 * @param {*} time 时间
 */
export const parseTimer = (time, serverTime) => {
    // // ios下 yyyy-mm-dd 需要转成 yyyy/mm/dd格式才能转成Date对象
    // let serverTime = stime ? typeof stime === 'string' ? +new Date(stime.replace(/\-/g, '/')) : stime : +new Date;
    // // server时间戳如果为10位，转换成本地时间戳 * 1000
    // if (serverTime.toString().length === 10) {
    //     serverTime = serverTime * 1000;
    // }
    // let timer = +new Date - serverTime;
    const parsetime = time ? (typeof time === 'string' ? +new Date(time.replace(/\-/g, '/')) : time) : (serverTime ? + new Date(serverTime) : +new Date);
    return parsetime;
}
/**
 * 时间比较
 * @param {*} t1 
 * @param {*} t2 
 */
export const diffTimer = (t1, t2, serverTime) => {
    // console.log('t1:', t1, parseTimer(t1), 't2:', t2, parseT2.format('Y-m-d H:i:s'), 'parseT1:', parseTimer(t1), 'parseT2:', parseTimer(t2));
    return parseTimer(t1, serverTime) - parseTimer(t2, serverTime);
}
/**
 * 使用iframe 调起scheme
 * @param {*} schema 
 */
export function execScheme(schema, delay = 1000) {
    const start_time = +new Date;
    let invokeTimer = null;
    var ifr = document.createElement('iframe');
    ifr.setAttribute('style', 'display:none');
    ifr.src = schema;
    document.body.appendChild(ifr);

    let hidden, visibilityChange;
    if (typeof document.hidden !== "undefined") {
        hidden = "hidden";
        visibilityChange = "visibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
        hidden = "webkitHidden";
        visibilityChange = "webkitvisibilitychange";
    }

    return new Promise((resolve, reject) => {
        invokeTimer = setTimeout(function () {
            document.body.removeChild(ifr);
            ifr = null;
            let end_time = +new Date - start_time;
            resolve({
                errno: 1,
                times: end_time,
                msg: 'invoke failure'
            });
            console.log('invoke failure', end_time);
        }, delay);

        let hiddenChangeHandler = (e) => {
            if (!!document[hidden] && invokeTimer) {
                clearTimeout(invokeTimer);
                let end_time = +new Date - start_time;
                resolve({
                    errno: 0,
                    times: end_time,
                    msg: 'invoke success'
                });
                console.log('invoke success', end_time);
                hiddenChangeHandler = null;
            }
        };
        // 移除监听器
        document.removeEventListener(visibilityChange, hiddenChangeHandler, false);
        // 添加监听器
        document.addEventListener(visibilityChange, hiddenChangeHandler, false);
    });
};
/**
 * 自动区分类型加载库/包
 * @param {Object} param0 
 */
export function loadUrl({
    funcName,
    url,
    cb,
    loadType = 'jsonp' | 'import'
}) {
    if (!funcName || !url) {
        return Promise.resolve(null);
    }
    if (window[funcName]) {
        return Promise.resolve(window[funcName]);
    }
    const loadInstance = loadType === 'import' ? import(`${url}`) : loadScript(url + (!!~url.indexOf('?') ? '&' : '?') + '_v=' + timestampToDate(+new Date, 'YYYY-MM-DD'));
    return loadInstance.then(func => {
        func = window[funcName] || func.default || func;
        console.log((funcName || '') + ' sdk loaded: ', !!func ? 'success!' : 'failure!');
        return cb ? cb(func || null) : func;
    });
}
/**
 * 判断链接类型
 * @param {String} uri 
 * @param {Function} cb 
 */
export function checkUrlType(uri = '', cb) {
    if (typeof uri === 'function') {
        uri = uri();
    }
    uri = decodeURIComponent(uri);
    let t = '';
    // 如果是锚点
    if (/^(\#)/i.test(uri)) {
        t = 'anchor';
    } else if (!/^((https?)\:\/\/|\#)/i.test(uri)) {
        t = 'scheme';
    } else {
        t = 'link';
    }
    return cb ? cb(t) : t;
}
/**
 * app版本比较
 * @param {Object|String} options 
 * @param {*} currentVer
 * @return {
 *      status: true|false  true: 比较通过, false: 比较未通过
 * }
 */
export function compareVersion(options, currentVer = '1.0') {
    // string类型则直接使用
    let baseVer = typeof options === 'object' ? (isIOS ? options.ios_ver : options.android_ver) : options;
    if (!baseVer) {
        baseVer = currentVer;
    } else {
        // 版本号支持使用|区分ios/android
        let tmpVer = baseVer.split('|');
        if (tmpVer.length === 2 && !!isAndroid) {
            baseVer = tmpVer[1];
        }
    }
    // 需要给1位版本数字前添加0
    let currentFirst = currentVer.split('.')[0];
    if (currentFirst < 10) {
        currentVer = '0' + currentVer;
    }
    let baseFirst = baseVer.split('.')[0];
    if (baseFirst < 10) {
        baseVer = '0' + baseVer;
    }
    // 支持匹配最大位数
    let matchMaxLen = 3;
    let currentVersion = currentVer.toString().replace(/\.(\d+\b)/ig, function (a, b) {
        return new Array(matchMaxLen - b.length + 1).join('0') + '' + b;
    }).replace(/\./g, '');
    let baseVersion = baseVer.toString().replace(/\.(\d+\b)/ig, function (a, b) {
        return new Array(matchMaxLen - b.length + 1).join('0') + '' + b;
    }).replace(/\./g, '');
    // let currentVersion = currentVer.toString().replace(/\.(\d+\b)/ig, '0$1').replace(/\./g, '');
    // let baseVersion = baseVer.toString().replace(/\.(\d+\b)/ig, '0$1').replace(/\./g, '');
    // 为了保证1位数组也能添加0，给maxLength+1
    let maxLength = baseVersion.length > currentVersion.length ? baseVersion.length + 1 : currentVersion.length + 1;
    baseVersion = baseVersion + new Array(maxLength - baseVersion.length).join('0');
    currentVersion = currentVersion + new Array(maxLength - currentVersion.length).join('0');
    // console.log(baseVer, baseVersion, currentVersion, +baseVersion < +currentVersion, options);
    return {
        status: +baseVersion <= +currentVersion, // true: 比较通过, false: 比较未通过
        baseVersion: baseVer,
        currentVersion: currentVer
    };
}
/**
 * ${xx|yy}字符串解析，支持 a|b 一元表达式解析
 * @param {*} params 
 */
export function tplCompile(tpl = '', words = {}) {
    const startTimer = +new Date;
    if (!tpl) {
        return tpl;
    }
    words = { ...words };
    let keys = Object.keys(words);
    let compiles = tpl.toString();
    let args = [];
    let values = [];
    keys.forEach(key => {
        let fixKey = key;
        // 如果属性名带-,空格等特殊字符则统一替换成_, 并移除原属性
        if (!!/(\-|\s)/.test(key)) {
            fixKey = key.replace(/\-|\s/g, '_');
            words[fixKey] = words[key];
            delete words[key];
        }
        const value = words.hasOwnProperty(fixKey) ? words[fixKey] : '';
        args.push(fixKey);
        values.push(value);
    });
    function compile(str = '', arg = [], val = []) {
        let complieStr = str;
        try {
            let strings = 'return `' + complieStr + '`';
            let newArgs = arg.concat([strings]);
            let fn = Function.apply(null, newArgs);
            complieStr = fn.apply(null, val);
        } catch (err) {
            // 移动端错误信息为: Can't find variable: xxxxx
            let badCase = err.message.match(/^can't\sfind\svariable\:\s?([a-z0-9_]+)/i);
            if (!badCase) {
                // pc端/模拟器内错误信息为: xxxx is not defined
                badCase = err.message.match(/^([a-z0-9_]+)\sis\snot\sdefined/i);
            }
            console.log('====>', err.message, badCase, str, words);
            if (!!badCase && badCase[1]) {
                // 如果是对象未定义报错, 则捕获对象名, 赋值""
                return compile(str, [
                    badCase[1],
                    ...arg
                ],
                    [
                        '',
                        ...val
                    ]
                );
            }
            let regexp = new RegExp('\\$\\{([^\}]+)\\}', 'ig');
            complieStr = complieStr.replace(regexp, (a, b) => {
                let fixWord = b || '';
                let newArgs = arg.concat(['return ' + fixWord]);
                let fn = Function.apply(null, newArgs);
                fixWord = fn.apply(null, val);
                return fixWord;
            });
            // console.warn('complie error:', err.message, +new Date - startTimer);
        }
        return complieStr;
    }
    compiles = compile(compiles, args, values);
    return compiles;
}
/**
 * 对象转参数格式
 */
export function parseParams(params, parseWords) {
    if (!params) {
        return '';
    }
    let keys = Object.keys(params);
    let args = [];
    keys.forEach(key => {
        let param = (params[key] || '');
        if (!!parseWords) {
            param = tplCompile(param, parseWords);
        }
        args.push(key + '=' + param);
    });
    return args.join('&');
}
export const units = [
    'width',
    'height',
    'padding',
    'margin',
    'font-size',
    'x',
    'y',
    'left',
    'top',
    'right',
    'bottom',
    'background-position-x',
    'background-position-y',
    'background-size',
    'background-position',
    'border-width',
    'border-radius'
];
/**
 * px转rem
 * @param {String|Number} value 要转换的值，可能会不带px单位
 * @param {String} unit 单位, 默认rem
 */
export const px2rem = (value, unit = 'rem') => {
    return value ? (value + '').replace(/([0-9.]+)(px|%)?/ig, function (a, b, c) {
        return c === '%' ? b + c : b / 100 + unit;
        // return c === '%' ? b + c : !!isPC ? b / 100 * 2.1 + unit : b / 100 + unit;
    }) : '';
}
/**
 * 更新对象
 * @param {*} params 被更新的对象
 * @param {*} obj
 */
export function mergeArgs(params = {}, obj = {}, useEncode = true) {
    // let keys = Object.keys(params);
    let newObj = {};
    (function (obj1, obj2) {
        Object.keys(obj1).forEach(key => {
            let value = obj1[key];
            if ({}.toString.call(value) === '[object Object]') {
                Object.keys(value).forEach(k => {
                    value[k] = (obj2[key] ? obj2[key][k] : null) || value[k] || '';
                });
                value = useEncode ? encodeURIComponent(JSON.stringify(value)) : JSON.stringify(value);
            } else {
                value = obj2[key] || obj1[key] || '';
            }
            newObj[key] = value;
        });
    })({ ...params }, obj);
    // keys.length && keys.forEach(key => {
    //     let value = params[key];
    //     if ({}.toString.call(value) === '[object Object]') {
    //         value = Object.assign({}, params[key], obj[key]);
    //         value = encodeURIComponent(JSON.stringify(value));
    //     } else {
    //         value = obj[key] || params[key] || '';
    //     }
    //     console.log(value, obj[key]);
    //     newObj[key] = value;
    // });
    return newObj;
}
/**
 * 设置背景颜色
 * @param {string} key css key
 * @param {any} val css value
 * @param {*} hitArr hits key custom array
 */
export function drawBackgroundImage(key, val, hitArr = []) {
    const hits = ['background', 'background-image', 'background-color'].concat(hitArr);
    let drawValue = '';
    if (!val || !~hits.indexOf(key)) {
        return {
            key,
            val
        };
    }
    if (val instanceof Array === true) {
        let colors = val.map(v => {
            const rate = (+v.rate > 0 ? ' ' + +v.rate + '%' : '');
            return typeof v === 'string' ? v : (v.color + rate);
        });
        if (colors && colors.length > 1) {
            key = 'background-image';
        }
        drawValue = colors.length > 1 ? `linear-gradient(to right, ${colors.join(', ')})` : colors.join(', ');
    } else if (({}).toString.call(val) === '[object Object]') {
        let deg = val.deg || '90deg';
        let colors = val.colors;
        if (colors && colors.length > 1) {
            key = 'background-image';
        }
        drawValue = colors && colors.length ? (colors.length === 1 ? colors.join(', ') : `linear-gradient(${deg}, ${colors.join(', ')})`) : '';
    } else {
        drawValue = val;
    }
    return {
        key,
        val: drawValue
    };
}

/**
 * 获取style样式
 */
export function getStyle(element, attr, NumberMode = 'int') {
    let target;
    // scrollTop 获取方式不同，没有它不属于style，而且只有document.body才能用
    if (attr === 'scrollTop') {
        target = element.scrollTop;
    } else if (element.currentStyle) {
        target = element.currentStyle[attr];
    } else {
        target = document.defaultView.getComputedStyle(element, null)[attr];
    }
    //在获取 opactiy 时需要获取小数 parseFloat
    return NumberMode == 'float' ? parseFloat(target) : parseInt(target);
}
/**
 * 页面到达底部，加载更多
 */
export function loadMore(element, callback) {
    let windowHeight = window.screen.height;
    let height;
    let setTop;
    let paddingBottom;
    let marginBottom;
    let requestFram;
    let oldScrollTop;
    document.body.addEventListener('scroll', () => {
        loadMore();
    }, false)
    //运动开始时获取元素 高度 和 offseTop, pading, margin
    element.addEventListener('touchstart', () => {
        height = element.offsetHeight;
        setTop = element.offsetTop;
        paddingBottom = getStyle(element, 'paddingBottom');
        marginBottom = getStyle(element, 'marginBottom');
    }, {
        passive: true
    })
    //运动过程中保持监听 scrollTop 的值判断是否到达底部
    element.addEventListener('touchmove', loadMore, {
        passive: true
    })
    //运动结束时判断是否有惯性运动，惯性运动结束判断是非到达底部
    element.addEventListener('touchend', () => {
        oldScrollTop = document.body.scrollTop;
        moveEnd();
    }, {
        passive: true
    })
    const moveEnd = () => {
        requestFram = requestAnimationFrame(() => {
            if (document.body.scrollTop != oldScrollTop) {
                oldScrollTop = document.body.scrollTop;
                loadMore();
                moveEnd();
            } else {
                cancelAnimationFrame(requestFram);
                //为了防止鼠标抬起时已经渲染好数据从而导致重获取数据，应该重新获取dom高度
                height = element.offsetHeight;
                loadMore();
            }
        })
    }
    const loadMore = () => {
        if (document.body.scrollTop + windowHeight >= height + setTop + paddingBottom + marginBottom) {
            callback();
        }
    }
}
/**
 * 显示返回顶部按钮，开始、结束、运动 三个过程中调用函数判断是否达到目标点
 */
let eventQueue = [];
export function showBack(callback = function () { }, element = document.body, wrapper = window) {
    let requestFram;
    let oldScrollTop;
    let toHeight = 0;
    let timer = null;
    if (eventQueue.some(queue => queue === element)) {
        return;
    }
    if ({}.toString.call(wrapper) === '[object Number]') {
        toHeight = +wrapper;
        wrapper = window;
    }
    const getScrollTop = function () {
        let dom = element || document.documentElement || document.body;
        let rect = getRect(dom); // body对象高度，如果有滚动高度也包括
        const rectFixTop = rect.top || getElementTop(dom);
        let docRect = (document.documentElement || document.body).getBoundingClientRect();
        let wrapperTop = wrapper.scrollTop;
        // let wHeight = window.innerHeight; // 浏览器窗口的视口
        let sTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop; // body距离滚动顶部的距离
        let rectPos = (rectFixTop || rect.y);
        let scrolltop = rectPos - sTop;
        if (!toHeight) {
            toHeight = rectPos + 1;
        }
        return {
            dom: dom,
            top: sTop,
            scrollTop: scrolltop,
            wrapperTop: wrapperTop || rectPos,
            rectTop: rectPos,
            height: rect.height,
            domRect: rect,
            docRect: docRect
        };
    };
    const scrollHandler = () => {
        !!timer && clearTimeout(timer);
        timer = setTimeout(() => {
            showBackFun();
        }, 200);
    };
    wrapper && (wrapper.removeEventListener('scroll', scrollHandler, false), wrapper.addEventListener('scroll', scrollHandler, false));
    // wrapper && wrapper.addEventListener('touchstart', function () {
    //     showBackFun();
    // }, {
    //     passive: true
    // })

    // document.addEventListener('touchmove', function () {
    //     showBackFun();
    // }, {
    //     passive: true
    // })

    // wrapper && wrapper.addEventListener('touchend', function () {
    //     oldScrollTop = getScrollTop();
    //     moveEnd();
    // }, {
    //     passive: true
    // });
    const moveEnd = function () {
        requestFram = requestAnimationFrame(function () {
            if (getScrollTop().scrollTop !== oldScrollTop.scrollTop) {
                oldScrollTop = getScrollTop();
                moveEnd();
            } else {
                cancelAnimationFrame(requestFram);
            }
            showBackFun();
        })
    }
    //判断是否达到目标点
    const showBackFun = function () {
        let scrollTop = getScrollTop();
        (!eventQueue.some(queue => queue === element)) && eventQueue.push(element);
        return callback(-scrollTop.scrollTop > toHeight, scrollTop, toHeight);
    }
    setTimeout(showBackFun, 0);
}
/**
 * 缓动函数
 * @param t 动画已消耗时间
 * @param b 原始值
 * @param c 目标值
 * @param d 持续时间
 */
function sineaseOut(t = 0, b = 0, c = 0, d = 1) {
    return c * ((t = t / d - 1) * t * t + 1) + b
}

/**
 * 将元素滚动到可见位置
 * @param scroller 要滚动的元素
 * @param viewer 需要可见的元素
 * @param justify 
 */
export function scrollToView(scroller, viewer, justify = 0) {
    if (!scroller || !viewer) {
        return
    }
    const isDoc = {}.toString.call(scroller) === '[object HTMLHtmlElement]' || {}.toString.call(scroller) === '[object HTMLBodyElement]';
    const scrollRect = getRect(scroller);
    const rect = getRect(viewer);
    const scrollStart = scroller.scrollTop || window.pageYOffset;
    const scroll = (rect.top || rect.y) - (isDoc ? 0 : (scrollRect.top || scrollRect.y)) - justify;
    let start = 0
    let anim = null;
    const step = (timestamp) => {
        if (!start) {
            start = timestamp
        }
        let stepScroll = sineaseOut(parseFloat(timestamp - start), 0, parseFloat(scroll), 500)
        let total = parseFloat(scrollStart) + parseFloat(stepScroll);
        if (!isDoc) {
            // 如果是页面元素
            scroller.scrollTop = total;
        } else {
            // chrome模拟器中使用document.documentElement
            document.documentElement.scrollTop = total;
            // 移动端需设置document.body
            document.body.scrollTop = total;
        }
        let compare = scroll > 0 ? total < scrollStart + scroll : total > scrollStart + scroll;
        if (compare) {
            anim = window.requestAnimationFrame(step)
        } else {
            window.cancelAnimationFrame(anim);
        }
    }
    window.requestAnimationFrame(step)
}
/**
 * 运动效果
 * @param {HTMLElement} element   运动对象，必选
 * @param {JSON}        target    属性：目标值，必选
 * @param {number}      duration  运动时间，可选
 * @param {string}      mode      运动模式，可选
 * @param {function}    callback  可选，回调函数，链式动画
 */
export function animate(element, target, duration = 400, mode = 'ease-out', callback) {
    clearInterval(element.timer);
    //判断不同参数的情况
    if (duration instanceof Function) {
        callback = duration;
        duration = 400;
    } else if (duration instanceof String) {
        mode = duration;
        duration = 400;
    }
    //判断不同参数的情况
    if (mode instanceof Function) {
        callback = mode;
        mode = 'ease-out';
    }
    //获取dom样式
    const attrStyle = attr => {
        if (attr === "opacity") {
            return Math.round(getStyle(element, attr, 'float') * 100);
        } else {
            return getStyle(element, attr);
        }
    }
    //根字体大小，需要从此将 rem 改成 px 进行运算
    const rootSize = parseFloat(document.documentElement.style.fontSize);
    const unit = {};
    const initState = {};
    //获取目标属性单位和初始样式值
    Object.keys(target).forEach(attr => {
        if (/[^\d^\.]+/gi.test(target[attr])) {
            unit[attr] = target[attr].match(/[^\d^\.]+/gi)[0] || 'px';
        } else {
            unit[attr] = 'px';
        }
        initState[attr] = attrStyle(attr);
    });
    //去掉传入的后缀单位
    Object.keys(target).forEach(attr => {
        if (unit[attr] == 'rem') {
            target[attr] = Math.ceil(parseInt(target[attr]) * rootSize);
        } else {
            target[attr] = parseInt(target[attr]);
        }
    });
    let flag = true; //假设所有运动到达终点
    const remberSpeed = {}; //记录上一个速度值,在ease-in模式下需要用到
    element.timer = setInterval(() => {
        Object.keys(target).forEach(attr => {
            let iSpeed = 0; //步长
            let status = false; //是否仍需运动
            let iCurrent = attrStyle(attr) || 0; //当前元素属性址
            let speedBase = 0; //目标点需要减去的基础值，三种运动状态的值都不同
            let intervalTime; //将目标值分为多少步执行，数值越大，步长越小，运动时间越长
            switch (mode) {
                case 'ease-out':
                    speedBase = iCurrent;
                    intervalTime = duration * 5 / 400;
                    break;
                case 'linear':
                    speedBase = initState[attr];
                    intervalTime = duration * 20 / 400;
                    break;
                case 'ease-in':
                    let oldspeed = remberSpeed[attr] || 0;
                    iSpeed = oldspeed + (target[attr] - initState[attr]) / duration;
                    remberSpeed[attr] = iSpeed
                    break;
                default:
                    speedBase = iCurrent;
                    intervalTime = duration * 5 / 400;
            }
            if (mode !== 'ease-in') {
                iSpeed = (target[attr] - speedBase) / intervalTime;
                iSpeed = iSpeed > 0 ? Math.ceil(iSpeed) : Math.floor(iSpeed);
            }
            //判断是否达步长之内的误差距离，如果到达说明到达目标点
            switch (mode) {
                case 'ease-out':
                    status = iCurrent != target[attr];
                    break;
                case 'linear':
                    status = Math.abs(Math.abs(iCurrent) - Math.abs(target[attr])) > Math.abs(iSpeed);
                    break;
                case 'ease-in':
                    status = Math.abs(Math.abs(iCurrent) - Math.abs(target[attr])) > Math.abs(iSpeed);
                    break;
                default:
                    status = iCurrent != target[attr];
            }
            if (status) {
                flag = false;
                //opacity 和 scrollTop 需要特殊处理
                if (attr === "opacity") {
                    element.style.filter = "alpha(opacity:" + (iCurrent + iSpeed) + ")";
                    element.style.opacity = (iCurrent + iSpeed) / 100;
                } else if (attr === 'scrollTop') {
                    element.scrollTop = iCurrent + iSpeed;
                } else {
                    element.style[attr] = iCurrent + iSpeed + 'px';
                }
            } else {
                flag = true;
            }
            if (flag) {
                clearInterval(element.timer);
                if (callback) {
                    callback();
                }
            }
        })
    }, 20);
}
/**
 * http图片转为https
 * @param {String} src 
 */
export function imgProxy(src = '') {
    return !src ? '' : ((/(pic\.rmb\.bdstatic\.com|vd3\.baidu\.com)/i.test(src)) ? src.replace(/http\:/i, 'https:') : src);
};
/**
 * 返回图片比例
 * @param {*} ratio 图片比例
 * @param {*} type 返回类型(Number|String)
 */
export function autoRatio(ratio = '0', type = 'number') {
    let autoRatio = 16 / 9;
    let amisRatio = (!!ratio && ratio !== '0' ? ratio : '16:9').split(/(?:\s+)?(?:\:|\/|x)(?:\s+)?/);
    if (+ratio > 0) {
        autoRatio = ratio;
    } else {
        if (amisRatio.length === 1) {
            autoRatio = 0;
        } else {
            autoRatio = amisRatio[0] / amisRatio[1];
        }
    }
    return type === 'string' ? amisRatio.join(':') : autoRatio;
}

/**
 * 图片缓存（memory/localstrage）
 * @param {String} src 图片url
 * @param {Function} callback   回调
 * @param {String}   mode    缓存到memory|localstrage
 */
export function getImageCache(src = '', cb, mode = 'memory') {
    src = imgProxy(src);
    Model.imageCaches = Model.imageCaches || {};
    if (Model.imageCaches[src]) {
        return Model.imageCaches[src];
    }
    let oImg = new Image();
    oImg.onload = oImg.oncomplete = function (e) {
        Model.imageCaches[src] = oImg;
        cb && cb(oImg);
        oImg.onload = null;
        return oImg;
    };
    oImg.src = src;
    return oImg;
};
/**
 * 一个简单的断言函数
 * @param value {Boolean} 断言条件
 * @param desc {String} 一个消息
 */
function assert(value, desc) {
    // let li = document.createElement('li');
    // li.className = value ? 'pass' : 'fail';
    // li.appendChild(document.createTextNode(desc));
    // document.getElementById('results').appendChild(li);
    console[!!value ? 'warn' : 'log'](desc);
}
/**
 * 一个测试套件，定时器是为了多次执行减少误差
 * @param fn {Function} 需要多次执行的代码块（需要测试、比对性能的代码块）
 * @param config {Object} 配置项，maxCount: 执行代码块的for循环次数，times: 定时器执行次数
 */
export function intervalTest(fn, config = {}) {
    let maxCount = config.maxCount || 1000;
    let times = config.times || 10;
    let timeArr = [];
    let timer = setInterval(function () {
        let start = +new Date;
        for (let i = 0; i < maxCount; i++) {
            fn.call(this);
        }
        let elapsed = +new Date - start;
        assert(elapsed > 100, 'Measured time: ' + elapsed + ' ms');
        timeArr.push(elapsed);
        if (timeArr.length === times) {
            clearInterval(timer);
            let average = timeArr.reduce((p, c) => p + c) / times;
            // let p = document.createElement('p');
            // p.innerHTML = `for循环：${maxCount}次，定时器执行：${times}次，平均值：${average} ms`;
            // document.body.appendChild(p);
            console.info(`for循环：${maxCount}次，定时器执行：${times}次，平均值：${average} ms`);
        }
    }, 1000);
};
export function str2Json(string = '') {
    let decodeResult = decodeURIComponent(string);
    let tmpRet = string;
    try {
        // const checkJson = decodeResult.toString().match(/\{|\[/);
        // tmpRet = checkJson && checkJson.index > -1 ? JSON.parse(decodeResult) : tmpRet;
        tmpRet = (decodeResult.toString().indexOf('{') > -1 || decodeResult.toString().indexOf('[') > -1) ? JSON.parse(decodeResult) : tmpRet;
        // console.log(decodeResult, tmpRet);
    } catch (error) { }
    return tmpRet;
};
/**
 * restful url解析
 * @param {*} url
 * @return {object} params object
 */
export function getRestFulArgs(url = location.href, safe) {
    if (typeof url === 'object') {
        return url;
    }
    if ({}.toString.call(safe) !== '[object Array]') {
        safe = safe ? [safe.toString()] : [];
    }
    // let restfulOptions = ['namespace', 'id', 'page_id', 'cid'];
    let urlObj = URL.parse(url);
    let restfulRoute = {};
    let urlPath = (urlObj.pathname || '').split('/');
    urlPath.shift();
    // (!!urlPath.length) && urlPath.map((u, i) => {
    //     // namespace不作为参数
    //     if (u && i > 0) {
    //         restfulRoute[restfulOptions[i]] = +u || 1;
    //     }
    // });
    let reg_url = /(?:[^\?]+)?\?([\w\W]+)$/;
    let reg_para = /([^&=]+)=([\w\W]*?)(&|$|#)/g;
    let arr_url = reg_url.exec(urlObj.search);
    let ret = {
        ...restfulRoute
    };
    if (arr_url && arr_url[1]) {
        let str_para = arr_url[1];
        let result;
        while ((result = reg_para.exec(str_para)) != null) {
            let tmpRet = str2Json(result[2]);
            if (!safe.length) {
                ret[result[1]] = tmpRet;
            } else {
                if (!!~safe.indexOf(result[1])) {
                    ret[result[1]] = tmpRet;
                }
            }
        }
    }
    return ret;
};
/**
 * 动态加载js
 * @param {*} url 
 * @return promise
 */
export function loadScript(url, attrs = {}) {
    return new Promise((resolve, reject) => {
        if (!url) {
            return resolve('empty');
        }
        let oHead = document.getElementsByTagName('head')[0];
        let oScript = document.createElement('script');
        oScript.type = 'text/javascript';
        Object.keys(attrs).forEach(key => {
            oScript.setAttribute(key, attrs[key]);
        });
        oScript.onload = oScript.onerror = function (e) {
            // typeof fn === 'function' && fn('onload');
            resolve(e);
            this.onload = null;
            this.onerror = null;
            // setTimeout(function () {
            //     oScript.parentNode.removeChild(oScript);
            // }, 100);
        };
        oScript.src = url;
        oHead.appendChild(oScript);
    });
};
/**
 * 格式化日期
 * @param {any} time 
 * @param {boolean} isValid 是否返回日期格式化结果 fase: 返回原值, true: 格式化后的值NaN
 */
export function parseDateTime(time = '', isValid = false) {
    let fixTime = time.toString().replace(/(\-|年|月|日)/g, '\/');
    fixTime = fixTime.toString().replace(/(日)/g, '');
    fixTime = fixTime.toString().replace(/(时|分|秒)/g, '\:');
    if (!!+fixTime) {
        fixTime = +(fixTime.toString().length < 13 ? fixTime.toString() + '000' : fixTime.toString());
    }
    fixTime = +new Date(fixTime);
    if (!time || (!!time && !fixTime)) {
        return isValid ? fixTime : (time || '');
    }
    return fixTime;
};
/**
 * 时间戳|年月日转xx时间前
 * @param {string} time 时间戳|年月日格式
 */
export function timeAgo(time = '', format = 'YYYY-MM-DD') {
    time = parseDateTime(time);
    let diffTime = (+new Date - +time) / 1000;
    if (diffTime < 0) {
        diffTime = 0;
    }
    switch (true) {
        case diffTime > (60 * 60 * 24 * 7):
            diffTime = timestampToDate(time, format);
            break;
        case diffTime >= (60 * 60 * 24):
            diffTime = Math.floor(diffTime / 60 / 60 / 24) + '天前';
            break;
        case diffTime >= (60 * 60):
            diffTime = Math.floor(diffTime / 60 / 60) + '小时前';
            break;
        case diffTime >= (60):
            diffTime = Math.floor(diffTime / 60) + '分钟前';
            break;
        case diffTime >= 0:
            diffTime = Math.floor(diffTime) + '秒前';
            break;
    }
    return diffTime;
}


/**
 * 时间戳转xxxx-xx-xx
 * @param time 时间戳
 */
export function timestampToDate(time = '', format = 'YYYY-MM-DD') {
    time = parseDateTime(time);
    const regexp = new RegExp('(YYYY|YY){0,4}(\\-|\\/|\\s|年|\\.){0,3}(MM|M){0,2}(\\-|\\/|\\s|月|\\.){0,3}(DD|D){0,2}(日|号|天){0,1}(\\s){0,1}(hh|HH|H|h){0,2}(\\:|小时|时){0,2}(mm|m){0,2}(\\:|分钟|分){0,2}(ss|s){0,2}(秒){0,1}(\\s){0,1}(星期|周){0,2}(W){0,1}', '');
    const date = new Date(+time);
    const YEAR = date.getFullYear();
    const MONTH = date.getMonth() + 1;
    const DAY = date.getDate();
    const HOURS = date.getHours();
    const MINUTE = date.getMinutes();
    const SECOND = date.getSeconds();
    const WEEK = "日一二三四五六".charAt(date.getDay());
    const dateTime = [];
    format.replace(regexp, (fmt, year, sp1, month, sp2, day, sp3, space, hours, sp4, minute, sp5, second, sp6, weekspace, sp7, week) => {
        // console.log(fmt, year, sp1, month, sp2, day, sp3, space, hours, sp4, minute, sp5, second, sp6, weekspace, sp7, week);
        year && dateTime.push(year.length === 4 ? YEAR : YEAR.toString().slice(2));
        sp1 && dateTime.push(sp1);
        month && dateTime.push(month.length === 1 ? MONTH : (MONTH < 10 ? ('0' + MONTH) : MONTH));
        sp2 && dateTime.push(sp2);
        day && dateTime.push(day.length === 1 ? DAY : (DAY < 10 ? ('0' + DAY) : DAY));
        sp3 && dateTime.push(sp3);
        space && dateTime.push(space);
        hours && dateTime.push(hours.lenth === 1 ? HOURS : (HOURS < 10 ? ('0' + HOURS) : HOURS));
        sp4 && dateTime.push(sp4);
        minute && dateTime.push(minute.length === 1 ? MINUTE : (MINUTE < 10 ? ('0' + MINUTE) : MINUTE));
        sp5 && dateTime.push(sp5);
        second && dateTime.push(second.length === 1 ? SECOND : (SECOND < 10 ? ('0' + SECOND) : SECOND));
        sp6 && dateTime.push(sp6);
        weekspace && dateTime.push(weekspace);
        sp7 && dateTime.push(sp7);
        week && dateTime.push(WEEK);
    });
    return dateTime.join('');
}
/**
 * 调起好看端登录
 * @param {*} event 点击对象
 * @param {*} args 登录参数
 * @param {*} cb 回调
 */
export function appLogin(event, args = {}, cb) {
    const appName = matrixApp();
    const isApp = getCookie('BAIDUCUID');
    const loginScheme = (schemeConfig[appName] && schemeConfig[appName].login || schemeConfig['baiduhaokan']['login']);
    const gotoPCLogin = function () {
        const passportUrl = 'https://passport.baidu.com/passApi/js/uni_login_wrapper.js?cdnversion=' + +new Date;
        return loadScript(passportUrl).then(wiseLoginShow);
    };
    const gotoH5Login = function () {
        const passportUrl = `https://wappass.baidu.com/passport/?login&tpl=wimn&sms=1&regtype=1&u=${encodeURIComponent(window.location.href)}`
        return window.location.href = passportUrl
    }
    if (!!isApp && (!!isHaokan || !!isMiniVideo)) {
        import(`./login/${appName}/`).then(appInstance => {
            appInstance = appInstance.default || appInstance;
            const loginConfig = appInstance(event, loginScheme, args, cb);
            if (!loginConfig.schema) {
                loginConfig.schema = loginConfig.scheme.name + parseParams(loginConfig.scheme.options.params);
            }
            console.log(appName + ' native login:', loginConfig);
            loginConfig && Model.$emit('scheme', loginConfig);
        }).catch(err => {
            gotoH5Login();
            console.log(err.message);
        });
    } else if (isPC) {
        gotoPCLogin();
    } else {
        gotoH5Login()
    }

}
/**
 * 调起好看webview打开专题H5
 * @param {*} event 点击对象
 * @param {*} args 登录参数
 * @param {*} cb 回调
 */
export function appHome(args = {}, event = document.body, cb) {
    const currentAppName = this.commondata && this.commondata.overall && this.commondata.overall.matrix_apps || '';
    const appName = currentAppName || matrixApp();
    const homeScheme = (schemeConfig[appName] && schemeConfig[appName].home || schemeConfig['baiduhaokan']['home']);
    const url_key = encodeURIComponent(location.href.split('#')[0]);
    let schemaConfig = {
        dom: event,
        source: args.source,
        url_key,
        scheme: {
            name: homeScheme.scheme,
            options: {
                params: homeScheme.params
            },
            params: {
                ...homeScheme.params,
                ...args,
                url_key
            }
        }
    };
    return Model.$emit('scheme', schemaConfig);
}
/**
 * 生成随机key
 */
export function getId() {
    var d = new Date().getTime();
    var uid = "xxxxxxxx-xxxx-2xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
        }
    );
    return uid;
}
/**
 * 首字母大写
 * @param {String} val 
 */
export function firstUpperCase(val = '') {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

export function mergeJSON(minor = {}, main = {}) {
    const isJSON = (target) => {
        return typeof target === "object" && target.constructor === Object;
    };
    for (var key in minor) {

        if (main[key] === undefined) { // 不冲突的，直接赋值
            main[key] = minor[key];
            continue;
        }

        // 冲突了，如果是Object，看看有么有不冲突的属性
        // 不是Object 则以main为主，忽略即可。故不需要else
        if (isJSON(minor[key])) {
            // arguments.callee 递归调用，并且与函数名解耦
            arguments.callee(minor[key], main[key]);
        }
    }
}


// pc|wise login|unlogin
const BAIDUID = getCookie('BAIDUID');
// wise login|unlogin
const BAIDUCUID = (() => {
    // 优先从UA里获取cuid并decode
    const ua = navigator.userAgent;
    const clientUA = (ua.match(/haokan(.*)/i) && ua.match(/haokan(.*)/i)[0]) ?
        ua.match(/haokan(.*)/i)[0].split('/') : [];
    return (clientUA[4] && decodeURIComponent(clientUA[4])) || getCookie('BAIDUCUID') || '';
})();
// pc|wise login
const BDUSS = getCookie('BDUSS');
// 为了开发测试方便使用
export const HAOKANID = BAIDUCUID || BAIDUID;

export function getDeviceConfig(args = {}) {
    const cbName = '__deviceConfigCb__';
    let timer = null;
    let options = {
        tab: '1023403j',
        tag: '1022893j',
        source: '',
        ...args,
        callback: cbName
    };
    const params = [];
    Object.keys(options).forEach(k => {
        params.push(k + '=' + options[k]);
    });
    const schema = 'baiduhaokan://action/getDeviceConfig/?' + params.join('&');
    return new Promise((r, n) => {
        timer && clearTimeout(timer);
        timer = setTimeout(() => {
            return r('error:' + schema);
        }, 100);
        window[cbName] = function (ret) {
            timer && clearTimeout(timer);
            r(ret);
            setTimeout(function () {
                delete window[cbName];
            }, 100);
        };
        return execScheme(schema);
    });
}

export async function XAFSend(options = {}) {
    const actAppKey = options.actAppKey || ''; // 活动APPKEY(渠道号)
    const sdkAppKey = options.sdkAppKey || ''; // 调用sdk的APPKEY
    const sdkUrl = '//sofire.bdstatic.com/js/xaf.js';
    let initOptions = {
        c: HAOKANID, // baidu cuid
        a: BDUSS, // baidu uid
        aid: actAppKey,
        ak: sdkAppKey,
        app: OS,
        ver: appVersion,
        vc: '', // ???
    };
    // baiduhaokan://action/getDeviceConfig/?tab=xx&tag=xx&source=xx&callback=xxxx
    // console.log(initOptions);
    // 不用获取vc
    // let result = getDeviceConfig().then((ret) => {
    //     console.log(ret);
    //     // alert(typeof ret === 'object' ? JSON.parse(ret) : ret);
    //     return ret;
    // });
    let result = window.xaf ? new Promise(r => r(window.xaf)) : loadScript(sdkUrl, {
        'data-app': sdkAppKey
    }).then(() => {
        return window.xaf && window.xaf.init(initOptions) ? window.xaf : (delete window.xaf, null);
    });
    // 获取zid
    result = result.then(xaf => {
        /**
         o: 值由活动方定义， 例如活动的不同操作、 步骤、 活动中不同环节等
        ev: 事件类型，
            预先分配事件ID定义：
            1： 点击活动按钮（ 或者活动操作）， 活动相关操作默认选择此事件
            2： 进入活动页面
            3： 注册
            4： 登录
            5： 分享
            6： 点赞
            7： 评论
            8： 提现
            9： 下单/提单
            10： 支付
            11： 业务自定义动作
        */
        const xafOptions = {
            o: options.task || '',
            ev: options.action || ''
        };
        return new Promise(r => !xaf ? r(null) : xaf.hgzAs(xafOptions, zid => r(zid)));
    });

    // 获取 to, vw

    result = result.then(zid => {
        let to = '';
        let vw = '';
        try {
            to = xaf.getData().Token;
            vw = xaf.getData().view;
        } catch (e) { }
        console.log('zid:', zid);
        console.log('to:', to);
        console.log('vw:', vw);
        return {
            zid,
            to,
            vw
        };
    });
    return result;
}

export function getUrlQuery(key, link = '') {
    let paramStr = '';
    if (link && typeof link === 'string') {
        paramStr = link.substring(link.indexOf('?') + 1, link.length).replace(/#\/$/, '');
    } else {
        paramStr = window.location.search.substr(1);
    }
    if (!key) {
        const urlList = paramStr.split('&');
        const urlObject = {};
        urlList.forEach(item => {
            const urlItem = item.split('=');
            if (urlItem[1]) {
                urlObject[urlItem[0]] = decodeURIComponent(urlItem[1]);
            }
        });
        return urlObject;
    }

    const reg = new RegExp(`(^|&)${key}=([^&]*)(&|$)`);
    const res = paramStr.match(reg);
    return res ? (res && res[2]) : undefined;
}
