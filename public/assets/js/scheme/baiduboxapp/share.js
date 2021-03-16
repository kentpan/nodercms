/* eslint-disable */
/**
 * 手百端分享初始化
 */
function createShareOptions(options = {}) {
    let originUrl = location.href.split('#')[0];
    const imageUrl = options.image_url || options.imageUrl || options.iconUrl || 'https://b.bdstatic.com/searchbox/image/cmsuploader/20161214/1481696369354077.png';
    let shareConfig = {
        title: options.title || '好看视频',
        content: options.content || '你想看的视频都在这里',
        iconUrl: imageUrl,
        imageUrl, // 这里的imageUrl和iconUrl暂时没有发现有什么区别，两个一般设成一样就ok了
        linkUrl: options.linkUrl || originUrl
    };
    return shareConfig;
}
export function initShare(options = {}) {
    let baiduConfig = createShareOptions(options);
    window['__baiduboxinitshareSuccesscallback'] = function (ret) {
        console.log('baiduboxapp init share success', ret);
        delete window['__baiduboxinitshareSuccesscallback'];
    };
    window['__baiduboxinitshareErrorcallback'] = function (e) {
        console.log('baiduboxapp init share failure', e);
        delete window['__baiduboxinitshareErrorcallback'];
    };
    window.BoxShareData = {
        successcallback: '__baiduboxinitshareSuccesscallback',
        errorcallback: '__baiduboxinitshareErrorcallback',
        options: {
            type: 'url', // android: '1'
            content: baiduConfig.content || "",
            iconUrl: baiduConfig.iconUrl || "",
            // imageUrl: baiduConfig.iconUrl || "", // 这里的imageUrl和iconUrl暂时没有发现有什么区别，两个一般设成一样就ok了
            linkUrl: baiduConfig.linkUrl || originUrl,
            mediaType: "all",
            title: baiduConfig.title || ""
        }
    };
    console.log('baiduboxapp init share', window.BoxShareData);
    return Promise.resolve();
}
/**
 * android手百H5调起端分享
 */
export function initAndroidShare(options = {}, config = {}) {
    const shareConfig = createShareOptions(options);
    return window.Box && window.Box.share(shareConfig)();
}