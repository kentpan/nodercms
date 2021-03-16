/* eslint-disable */
/**
 * 贴吧端分享初始化
 */
export function initShare(options = {}) {
    let originUrl = location.href.split('#')[0];
    let tiebaConfig = {
        title: options.title || '好看视频',
        desc: options.content || '你想看的视频都在这里',
        img: options.image_url || options.imageUrl || 'https://b.bdstatic.com/searchbox/image/cmsuploader/20161214/1481696369354077.png',
        url: options.linkUrl || originUrl
    };
    return import('@baidu/tieba-invoke').then(func => {
        func = func.default || func;
        console.log('tieba init share sdk loaded: ', func ? 'success!' : 'failure!');
        if (func) {
            func('invokeNative.registerShareDataNew', tiebaConfig,
                ret => {
                    console.log('register succ', ret);
                },
                e => {
                    console.log('register fail', e);
                }
            );
        }
    });
}