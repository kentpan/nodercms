/**
 * @file matrix utils
 * Created by panjian01@baidu.com
 */
/* eslint-disable */
const {
    loadScript,
    timestampToDate
} = require('../mUtils');
const {
    ua,
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
} = require('./ua');
import schemeConfig from './config';
export function matrixApp(showType = 'name') {
    let schemeName = '';
    let v = '0.0.0';
    switch (true) {
        case !!isBaiduApp:
            schemeName = 'baiduboxapp';
            v = baiduAppVersion;
            break;
        case !!isTieba:
            schemeName = 'com.baidu.tieba';
            v = tiebaVersion;
            break;
        case !!isMiniVideo:
            schemeName = 'bdminivideo';
            v = minivideoVersion;
            break;
        case !!isHaokan:
            schemeName = 'baiduhaokan';
            v = haokanVersion;
            break;
        case !!isWeiXin && showType !== 'inbox':
            schemeName = 'wechat';
            break;
        case !!isQQ && showType !== 'inbox':
            schemeName = 'qq';
            break;
        case !!isWeiBo && showType !== 'inbox':
            schemeName = 'weibo';
            break;
        case !!isBaiduHi && showType !== 'inbox':
            schemeName = 'baiduhi';
            break;
    }
    switch (showType) {
        case 'v':
            return v;
        case 'osVersion':
            return appVersion;
        default:
            return schemeName;
    }
}
export function getAppNameWithChannel(channel = '') {
    if (!channel) {
        return 'baiduhaokan';
    }
    let appName = 'baiduhaokan';
    let apps = Object.keys(schemeConfig);
    apps.forEach(key => {
        let app = schemeConfig[key];
        if (app.sfrom === channel) {
            return appName = key;
        }
    });
    return appName;
}
// 配置的当前矩阵, 支持分享按分享端回流&sfrom=haokanh5share
export function getCurrentAppName(scope, storeCommonData = null) {
    const commonData = storeCommonData || scope.commondata || {};
    // 必须得传inbox参数获取矩阵内的appName, 为空则取配置的默认app
    let matrixAppName = (commonData && commonData.overall && commonData.overall.matrix_apps) || matrixApp('inbox') || 'baiduhaokan';
    let channel = '';
    // 如果开启了分享按端回流
    if (commonData && commonData.overall && !!+commonData.overall.invoke_source) {
        channel = scope.$parseURI.sfrom;
    }
    if (!channel) {
        return matrixAppName;
    }
    let apps = Object.keys(schemeConfig);
    apps.forEach(key => {
        let app = schemeConfig[key];
        if (app.sfrom === channel) {
            return matrixAppName = key;
        }
    });
    // 判断从传参得到的回流app scheme是否在配置的支持矩阵内, 不在则使用配置的默认app
    let matrixApps = commonData && commonData.overall && commonData.overall.matrix_support_apps;
    matrixAppName = !!~matrixApps.split(',').indexOf(matrixAppName) ? matrixAppName : commonData.overall.matrix_apps;
    return matrixAppName;
}
export function matrixShare(sfrom = '') {
    const name = matrixApp();
    let appName = 'baiduhaokan';
    if (!!sfrom) {
        Object.keys(schemeConfig).forEach(key => {
            if (schemeConfig[key] && schemeConfig[key]['sfrom'] === 'key') {
                return appName = key;
            }
        });
        return appName;
    }
    return name ? (schemeConfig[name] && schemeConfig[name]['sfrom'] || 'haokanh5share') : 'wiseh5share';
}
export function checkInBox(apps = []) {
    let inbox = false;
    apps.forEach(key => {
        switch (key) {
            case 'baiduboxapp':
                if (!!isBaiduApp) {
                    return inbox = true;
                }
                break;
            case 'baiduhaokan':
                if (!!isHaokan) {
                    return inbox = true;
                }
                break;
            case 'com.baidu.tieba':
                if (!!isTieba) {
                    return inbox = true;
                }
                break;
            case 'bdminivideo':
            case 'minivideo':
                if (!!isMiniVideo) {
                    return inbox = true;
                }
                break;
                // 新增矩阵需要这儿添加inbox检测
        }
    });
    return inbox;
};
/**
 * 将通用配置的 type 字段，映射到好看的 type 字段
 *
 * @param universalType 通用 type 字段
 */
function getType(universalType = 'url') {
    const typeMap = {
        text: 1,
        image: 2,
        url: 5,
        video: 6
    };
    if (!universalType) {
        return 5;
    } else if (typeMap[universalType]) {
        return typeMap[universalType];
    }
    return 5;
}
/**
 * 好看分享数据
 */
export function haokanShareOptions(option = {}) {
    const initShareConfig = {
        title: option.title,
        content: option.content,
        image_url: option.imageUrl || option.image_url || option.iconUrl,
        url_key: option.linkUrl,
        type: getType(option.type),
        share_type: option.share_type || 0,
        tab: option.tab || '',
        tag: option.tag || '',
        source: option.source || '',
        show_share: !!option.show_share,
        wbtitle: option.wbtitle || option.title,
        wbcontent: option.wbcontent || option.content,
        hideitems: option.hideitems || '',
        toastorder: option.toastorder || '',
        orderprameter: option.orderprameter || ''
    };
    if (option.activity_type) {
        initShareConfig.activity_type = option.activity_type;
    }
    if (option.active_id) {
        initShareConfig.active_id = option.active_id;
    }
    return initShareConfig;
}

export function autoLoadInvoke(funcName, url, cb) {
    if (!funcName || !url) {
        return cb && cb();
    }
    if (window[funcName]) {
        cb && cb(window[funcName]);
    } else {
        loadScript(url + (!!~url.indexOf('?') ? '&' : '?') + '_v=' + timestampToDate(+new Date, 'YYYY-MM-DD')).then(() => {
            console.log(funcName + ' sdk loaded: ', !!window[funcName] ? 'success!' : 'failure!');
            if (!window[funcName]) {
                return;
            }
            cb && cb(window[funcName]);
        });
    }
}
