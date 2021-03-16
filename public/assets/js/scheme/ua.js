/*
 * @Author: your name
 * @Date: 2020-04-30 14:16:33
 * @LastEditTime: 2020-06-05 16:40:26
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /server/Users/panjian01/project/efe/haokan-fe/haokan-nodeserver/node-apps/apps/zt-activity/vue-src/utils/scheme/ua.js
 */
/**
 * @file matrix UA
 * Created by panjian01@baidu.com
 */
/* eslint-disable */
const uag = navigator.userAgent;
export const ua = uag;
export const iosVer = uag.match(/cpu iphone os (.*?) like mac os/i);
export const adrVer = uag.match(/android [\d._]+/i);
export const isBaiduApp = uag.match(/baiduboxapp\/([\d\.]+)/i);
export const baiduAppVersion = !!isBaiduApp ? isBaiduApp[1] : '0';
export const isHaokan = uag.match(/haokan\/([\d\.]+)/i);
export const haokanVersion = !!isHaokan ? isHaokan[1] : '0';
export const isIpad = /ipad/i.test(uag);
export const isIOS = /iphone/i.test(uag);
export const iosVersion = parseInt((iosVer && iosVer[1] || '').replace(/_/g, "."), 10) || 0;
export const isAndroid = (uag.indexOf('Android') > -1 || uag.indexOf('Adr') > -1);
export const androidVersion = adrVer ? parseInt(adrVer[0].replace(/[^\d.]+/i, ''), 10) : 0;
export const appVersion = isIOS ? (iosVer && iosVer[1] || '').replace(/_/g, ".") : (adrVer && adrVer[0] || '').replace(/[^\d.]+/i, '');
export const OS = isIOS ? 'iOS' : (isAndroid ? 'Android' : 'universe');
export const isWeiXin = /MicroMessenger/i.test(uag);
export const isQQ = /QQ/i.test(uag);
export const isWeiBo = /Weibo/i.test(uag);
export const isMiniVideo = uag.match(/minivideo\/([\d\.]+)/i);
export const minivideoVersion = !!isMiniVideo ? isMiniVideo[1] : '0';
export const isTieba = uag.match(/(?:tieba|bdtb)(?:[^\/]+)?(?:\/|\s)([\d\.]+)/i);
export const tiebaVersion = !!isTieba ? isTieba[1] : '0';
export const isBaiduHi = /baiduhi/i.test(uag);
export const isPC = (!isIOS && !isAndroid);
export const isSafari = detectSafari();

function detectSafari() {
    const ua = window.navigator.userAgent;
    const ret = ua.match(
        /(MSIE|(?!Gecko.+)Firefox|(?!AppleWebKit.+Chrome.+)Safari|(?!AppleWebKit.+)Chrome|AppleWebKit(?!.+Chrome|.+Safari)|Gecko(?!.+Firefox))(?: |\/)([\d.apre]+)/
    );
    let likeSafari = false;
    if (ret && ret[1] && ret[1].toLowerCase() === 'safari') {
        likeSafari = true;
    }
    if (
        likeSafari
        && !/CriOS|UCBrowser|fxiOS|QHBrowser|MQQBrowser|baidubrowser|MicroMessenger|SogouMobileBrowser/i.test(
            ua
        )
    ) {
        return true;
    }
    return false;
}
function getNetworkType() {
    let networkStr = uag.match(/NetType\/\w+/i) ? uag.match(/NetType\/\w+/i)[0] : 'NetType/other';
    networkStr = networkStr.toLowerCase().replace('nettype/', '');
    let networkType;
    switch (networkStr) {
        case 'wifi':
            networkType = 'wifi';
            break;
        case '5g':
            networkType = '5g';
        case '4g':
            networkType = '4g';
            break;
        case '3g':
        case '3gnet':
            networkType = '3g';
            break;
        case '2g':
            networkType = '2g';
            break;
        default:
            networkType = 'other';
    }
    return networkType;
}
export const network = getNetworkType();