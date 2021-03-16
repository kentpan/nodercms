/* eslint-disable */
/**
 * QQ分享
 */
export function initShare(options = {}) {
    let originUrl = location.href.split('#')[0];
    let qqConfig = {
        title: options.title || '好看视频',
        content: options.content || '你想看的视频都在这里',
        iconUrl: options.image_url || options.imageUrl || 'https://b.bdstatic.com/searchbox/image/cmsuploader/20161214/1481696369354077.png',
        linkUrl: options.linkUrl || originUrl
    };
    window.shareConfig && window.shareConfig.init(qqConfig);
    return Promise.resolve();
}