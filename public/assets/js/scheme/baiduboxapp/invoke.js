/**
 * @file 手百调起
 * @author panjian01@baidu.com
 */
 /* eslint-disable */
 import {
     isHaokan,
     haokanVersion,
     isIOS,
     iosVersion,
     isAndroid,
     androidVersion,
     isWeiXin,
     isQQ,
     isWeiBo,
     isMiniVideo,
     minivideoVersion,
     isTieba,
     tiebaVersion,
     isBaiduHi,
     isBaiduApp
 } from '../ua';
 const {
     autoLoadInvoke
 } = require('../matrix');
import schemeConfig from '../config';
import { execScheme } from '../../mUtils';
export default function invokeBaiduBoxApp(args = {}, options = {}, cb, scope = this) {
    const pkgName = args.pkg || 'com.baidu.searchbox';
    const commonData = scope.commondata || scope.$store.state.commondata;
    const source = args.source || (commonData && commonData.statistics && commonData.statistics.source) || '';
    const from = args.from || source.split('-')[0] || '';
    const channel = args.channel || source.split('-')[2] || '';
    const appName = 'baiduboxapp';
    // ios失败下载url
    const iosUrl = args.iosUrl || 'https://itunes.apple.com/cn/app/id382201985?mt=8';
    // 安卓失败下载url
    const pkgUrl = args.pkgUrl || '';
    let baiduboxArgs = schemeConfig[appName] && schemeConfig[appName].home && schemeConfig[appName].home.params || {};
    baiduboxArgs = {
        ...baiduboxArgs,
        source,
        from,
        channel,
        logargs: {
            ...baiduboxArgs.logargs,
            source: from,
            page: 'haokan_zt_activity',
            channel
        },
        iosForceScheme: false,
        failUrl: iosUrl, // ios9.0及以上，调起失败跳转页面
        failCallback() {
            // 需要添加安卓调起失败的情况
            let invokeTimer = setTimeout(function () {
                clearTimeout(invokeTimer);
                var isInvoke = document.hidden || document.webkitHidden;
                if (!isInvoke && (!!pkgUrl || !!iosUrl)) {
                    location.href = isIOS ? iosUrl : pkgUrl;
                }
            }, 2000);
        }
    };
    // 保证贴吧调起成功，添加参数
    if (!!isTieba) {
        baiduboxArgs.enable_tieba_native_open = 1;
    }
    let schema = args.schema || args.url_key || '';
    if (!!isBaiduApp) {
        // 如果是H5链接, 则使用easybrowser直接调起
        if (!!/^(https?|\#)/i.test(decodeURIComponent(schema))) {
            // 直接用easybrowser打开H5页面(带分享按钮)
            schema = `baiduboxapp://v1/easybrowse/open?url=${schema}&newbrowser=1&style={"toolbaricons":{"toolids":["3"], "tids":["3"]}}`;
            // schema = `baiduboxapp://v1/browser/open?url=${schema}`;
        }
        console.log('baiduboxinvoke==>', schema, args.videolandUrl, args);
        return schema ? (location.href = schema) : '';
    }
    // 因H5 url统一进行了编码, 所以这里得先解码
    schema = decodeURIComponent(schema);
    let urlKey = urlKey && decodeURIComponent(args.url_key);
    // realScheme  调用方传入iosScheme和androidCommand参数，用于直接换起scheme
    let realScheme = {}
    if (!schema && !urlKey) {
        args.iosScheme && (realScheme.iosScheme = args.iosScheme)
        args.androidCommand && (realScheme.androidCommand = args.androidCommand)
    }
    baiduboxArgs = {
        ...baiduboxArgs,
        ...realScheme,
        url: urlKey || schema,
        // 把口令参数透传给下载中间页(需要在下载中间页复制口令时用)
        copyTokenData: {
            activity_id: args.activety_id || '',
            url: urlKey || schema
        }
    };
    if (!!window.OpenBox) {
        const openbox = window.OpenBox(baiduboxArgs);
        console.log(!!window.OpenBox + ' invokeBaiduBoxApp ==>', baiduboxArgs, args, schema);
        openbox && openbox.open();
    }
}