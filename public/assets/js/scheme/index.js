/**
 * @file haokan scheme
 * Created by panjian01@baidu.com
 */
/* eslint-disable */
// const {launch, invoke, download} = require('@baidu/launch-hk');
// const STORE = require('../../store/');
import URL from 'url';
const {
    safeHref,
    setStore,
    getStore,
    execScheme,
    imgProxy,
    parseParams,
    mergeArgs,
    loadScript,
    timestampToDate,
    compareVersion,
    tplCompile
} = require('../mUtils');
import {
    ua,
    network,
    isBaiduApp,
    baiduAppVersion,
    isHaokan,
    haokanVersion,
    isIOS,
    isPC,
    iosVersion,
    isAndroid,
    androidVersion,
    appVersion,
    OS,
    isWeiXin,
    isQQ,
    isWeiBo,
    isMiniVideo,
    minivideoVersion,
    isTieba,
    tiebaVersion,
    isBaiduHi,
    isIpad
} from './ua';
import matrixSchemeConfig from './config';
import invokeHaokanApp from './baiduhaokan/invoke';
import invokeMinivideoApp from './bdminivideo/invoke';
import invokeTiebaApp from './com.baidu.tieba/invoke';
import invokeBaiduBoxApp from './baiduboxapp/invoke';

const {matrixApp, matrixShare} = require('./matrix');

let originUrl = location.href.split('#')[0];
function getOriginUrl(url, hostname = '', share = '') {
    url = url || originUrl || '';
    if (hostname) {
        url = hostname + (location.pathname || '/zt/activity/index') + location.search;
    }
    if (share) {
        let fixUrl = URL.parse(url, true);
        let query = fixUrl.query || {};
        query.sfrom = share;
        url = fixUrl.protocol + '//' + fixUrl.host + fixUrl.pathname;
        if (Object.keys(query).length) {
            url += '?' + parseParams(query);
        }
    }
    // console.log(url);
    return url;
}
export const schemeConfig = matrixSchemeConfig;
/**
 * 端能力调起统一入口
 * @param {*} config 调起参数
 * @param {*} options 矩阵参数
 * @param {*} cb 回调函数
 */
export function invokeApp(config = {}, options = {}, cb) {
    const that = this;
    // UA检测当前APP
    const currentAppName = matrixApp();
    let {
        enableNaDownLoad, // 是否开启了安卓手百端能力下载好看(未安装)
        matrixAppName, // amis上配置的默认app
        invokeSchemeName, // 目标scheme
        inBox, // 是否为配置的矩阵内
        inApp // 是否为配置的默认app (或者 当前app和调起scheme一致)
    } = options;
    let scheme = config.scheme && config.scheme.scheme || '';
    // const decodeScheme = decodeURIComponent(scheme);
    // // 调起的目标scheme的协议头
    // let invokeSchemeName = decodeScheme.match(/^((?:\w|\.)+)\:\/\//i);
    // invokeSchemeName = invokeSchemeName ? invokeSchemeName[1] : (!!inBox ? currentAppName : matrixAppName);
    // TODO: 检测判断调起类型, 各自调起执行
    // h5 url: webview/?
    // 视频落地页: video/detail/?
    // 作者页: author/detail/?
    // 直播间: video/live/?
    // 小程序: swan/?
    // login: schemeConfig.login
    // share: schemeConfig.share
    // 其他: 贴吧帖子, 进吧, wechat, qq, hi, weibo
    switch (invokeSchemeName) {
        case 'baiduhaokan':
            // 因android贴吧调起好看只支持webview和detail, 所以当调起为作者页时要改为webview调起好看打开H5作者页
            if (matrixAppName === 'com.baidu.tieba' && invokeSchemeName === 'baiduhaokan' && /author\/details\//i.test(scheme) && isAndroid) {
                const authorId = config.scheme.params.url_key || config.scheme.params.authorId;
                if (authorId) {
                    let source = config.scheme.params.source || '';
                    let authorUrl = 'https://haokan.baidu.com/author/' + authorId + '?source=' + source;
                    let authorScheme = 'baiduhaokan://webview/?';
                    config.scheme.scheme = authorScheme;

                    let authorParams = {
                        url_key: encodeURIComponent(authorUrl),
                        source,
                        tab: config.scheme.params.tab || '',
                        tag: config.scheme.params.tag || '',
                        swipe_back: false
                    };
                    let authorParamArr = [];
                    Object.keys(authorParams).forEach(key => {
                        authorParamArr.push(key + '=' + authorParams[key]);
                    });
                    authorScheme += authorParamArr.join('&');

                    config.url_key = authorParams.url_key;
                    delete config.scheme;
                    // 赋值schema属性, 用于直接执行scheme
                    config.schema = authorScheme;
                    scheme = '';
                }
            }
            // 不能使用import方式异步加载, 会导致第一次点击无法将scheme写入剪贴板
            invokeHaokanApp.call(that, config, options, cb);
            break;
        case 'baiduboxapp':
            // 如果是手百安卓分享scheme, 则走Box库
            if (!!/^baiduboxapp\:\/\/callShare/i.test(scheme) && isAndroid && window.Box && config.scheme && config.scheme.params) {
                let deOptions = decodeURIComponent(config.scheme.params.options);
                try {
                    deOptions = JSON.parse(deOptions);
                    let shareOptions = {
                        "imageUrl": "",
                        "mediaType": "all",
                        ...deOptions,
                        "pannel": ["weixin_timeline", "weixin_friend", "qqfriend", "qqdenglu", "baiduhi", "baidu_friend", "sinaweibo", "copylink", "others", "screenshot"],
                        // "command": {
                        //     "cmd_pannel": ["weixin_friend", "qqfriend"],
                        //     "info": {
                        //         "type": 1,
                        //         "img_show": "https://b.bdstatic.com/searchbox/icms/searchbox/img/kouling/img1.png",
                        //         "img_save": "http://thyrsi.com/t6/655/1547363731x2728278638.jpg",
                        //         "key": "8RAQofJLx6fNlL61IM-m9_MhXktQrwkhYMw3Yt5QFt4dhLIJf5F-NN4HwztMCAqv9NXrkZbaC",
                        //         "title": "度口令1",
                        //         "content": "[手机百度]1年终红包再加10亿！1月1日起还有机会额外获得专享红包哦！复制此消息，打开最新版手机百度就能领取！"
                        //     }
                        // }
                    };
                    return import(`./${invokeSchemeName}/share`).then(func => {
                        func = func && func.default || func;
                        func.initAndroidShare && func.initAndroidShare(shareOptions, config, cb);
                    })
                } catch (err) {
                    return console.log(err);
                }
            }
            invokeBaiduBoxApp.call(that, config, options, cb);
            // import(`./${invokeSchemeName}/invoke`).then(func => {
            //     func = func && func.default || func;
            //     func.invokeApp.call(that, config, options, cb);
            // });
            break;
        case 'tiebaclient':
        case 'bdtiebalive':
        case 'com.baidu.tieba':
            invokeSchemeName = 'com.baidu.tieba';
            // 不能使用import方式异步加载, 会导致第一次点击无法写入剪贴板
            invokeTiebaApp.call(that, config, options, cb);
            // import(`./${invokeSchemeName}/invoke`).then(func => {
            //     func = func && func.default || func;
            //     func.call(that, config, options, cb);
            // });
            break;
        case 'bdminivideo':
        case 'minivideo':
            invokeSchemeName = 'bdminivideo';
            // 不能使用import方式异步加载, 会导致第一次点击无法写入剪贴板
            invokeMinivideoApp.call(that, config, options, cb);
            // import(`./${invokeSchemeName}/invoke`).then(func => {
            //     func = func && func.default || func;
            //     func.call(that, config, options, cb);
            // });
            break;
        default:
            scheme && execScheme(scheme);
            break;
    }
}

/**
 * 初始化分享入口
 * @param {Object} options 
 */
export function initShare(options = {}, scope) {
    scope = scope || this || {};
    const commonData = scope.commondata;
    const hostName = !!scope.$isDev ? '' : (commonData && commonData.share && commonData.share.hostname);
    let linkUrl = options.linkUrl;
    const scrpitRoot = scope.$scriptRoot;
    const currentAppName = matrixApp();
    // console.log(currentAppName + '===== init share:', options);
    switch (!0) {
        case !!isBaiduApp:
        case !!isHaokan:
        case !!isMiniVideo:
        case !!isTieba:
            linkUrl = getOriginUrl(linkUrl, hostName, matrixShare());
            options.linkUrl = linkUrl;
            import(`./${currentAppName}/share.js`).then(func => {
                func = func.default || func;
                func && func.initShare(options);
                // android手百调起分享面板需要预先加载调起库window.Box
                !!isBaiduApp && !window.Box && isAndroid && loadScript(scrpitRoot + '/assets/js/baidubox.box-v2.min.js?_v=' + timestampToDate(+new Date, 'YYYY-MM-DD')).then(() => {
                    console.log('baidubox android initshare: ', !!window.Box ? 'success!' : 'failure!');
                });
            });
            break;
        case !!isWeiXin:
            // 分享url跟当前location.href必须一致, 不能附加fromchannel参数
            linkUrl = getOriginUrl(linkUrl, hostName);
            options.linkUrl = linkUrl;
            // //res.wx.qq.com/open/js/jweixin-1.2.0.js
            loadScript('//res.wx.qq.com/open/js/jweixin-1.6.0.js').then(() => {
                const API = require('../../store/api').default;
                const shareOption = {
                    url: options.linkUrl
                };
                return API.getWXToken(shareOption).then(res => {
                    if (res && (+res.errno === 0 || +res.status === 0) && res.data) {
                        options = {
                            ...options,
                            wx: {
                                appId: res.data.appId,
                                timestamp: res.data.timestamp,
                                nonceStr: res.data.nonceStr,
                                signature: res.data.signature
                            }
                        };
                        import(`./${currentAppName}/share.js`).then(func => {
                            func = func.default || func;
                            func.initShare(options).then(wxShare => {
                                wxShare.upShare();
                            });
                        });
                    }
                });
            });
            break;
        case !!isBaiduHi:
            linkUrl = getOriginUrl(linkUrl, hostName, 'baiduhih5share');
            options.linkUrl = linkUrl;

            import(`./${currentAppName}/share.js`).then(func => {
                func = func.default || func;
                func.initShare(options);
            });
            break;
        case isQQ:
            linkUrl = getOriginUrl(linkUrl, hostName, 'qqh5share');
            options.linkUrl = linkUrl;
            import(`./${currentAppName}/share.js`).then(func => {
                func = func.default || func;
                func.initShare(options);
            });
            break;
    }
}
/**
 * H5分享入口
 * @param {Object} options 
 */
export function h5Share(options = {}, scope) {
    scope = scope || this;
    const currentAppName = matrixApp();
    const commonData = scope.commondata;
    const hostName = !!scope.$isDev ? '' : (commonData && commonData.share && commonData.share.hostname);
    let linkUrl = options.linkUrl;
    // 端外分享回流添加参数fromchannel用于标识回流app, 微信除外
    if (currentAppName !== 'wechat') {
        linkUrl = getOriginUrl(linkUrl, hostName, matrixShare());
    }
    options.linkUrl = linkUrl;
    // console.log(currentAppName, options);
    switch (!0) {
        case !!isHaokan:
            import(`./${currentAppName}/share.js`).then(func => {
                func = func.default || func;
                return func && func.h5Share(options);
            });
            break;
    }
}