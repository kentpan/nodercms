/* eslint-disable */
/**
 * 微信分享初始化
 */
export function initShare(options = {}) {
    let originUrl = location.href.split('#')[0];
    const jsApiListOpt = [
        'onMenuShareTimeline',
        'onMenuShareAppMessage',
        'onMenuShareQQ',
        'onMenuShareWeibo',
        'onMenuShareQZone'
        // 'updateAppMessageShareData',
        // 'updateTimelineShareData'
    ];
    if (options.wx && window.wx) {
        wx.config({
            debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: options.wx.appId, // 必填，公众号的唯一标识
            timestamp: options.wx.timestamp, // 必填，生成签名的时间戳
            nonceStr: options.wx.nonceStr, // 必填，生成签名的随机串
            signature: options.wx.signature, // 必填，签名
            jsApiList: jsApiListOpt // 必填，需要使用的JS接口列表
        });
        console.log('wx share initialized');
    } else {
        console.log('wx config error!');
    }
    let default_options = {
        channel: options.channel || 'wechat',
        title: options.title || 'yooz柚子二代电子烟实体店授权销售渠道和代理',
        link: options.linkUrl || originUrl,
        content: options.content || 'YOOZ柚子二代一手货源,正规品牌授权渠道代理,拥有YOOZ柚子实体店,yooz柚子二代微商购买,yooz柚子二代网上购买',
        icon: options.iconUrl || options.image_url || '/themes/default/assets/img/yooz-logo.png',
        source: options.source || ''
    };
    const wxShare = {
        upShare: function (params = {}) {
            let imgUrl = params.iconUrl || params.image_url || default_options.icon;
            // 微信会在第二次分享的连接后面加上参数，然后再次去后台验签的时候就会失败
            let shareUrl = default_options.link || originUrl;
            let shareOptions = {
                // debug: location.search.indexOf('baidu_haokan_wx_debug=1') > 0,
                title: params.title || default_options.title,
                link: shareUrl,
                iconUrl: imgUrl,
                imgUrl: imgUrl,
                content: params.content || default_options.content,
                source: params.source || default_options.source,
                channel: params.channel || default_options.channel,
                titleDefault: default_options.title,
                contentDefault: default_options.content,
                iconUrlDefault: default_options.icon,
                // inbox: matrixApp() || 'wise'
            };
            window.wx && (wx.ready(function () {
                let shareConfig = {
                    title: shareOptions.title, // 分享标题
                    desc: shareOptions.content, // 分享描述
                    link: shareUrl, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                    imgUrl: imgUrl, // 分享图标
                    success: function (ret) {
                        // 用户确认分享后执行的回调函数
                    },
                    fail: function (res) {}
                };
                // 2.1 监听“分享给朋友”，按钮点击、自定义分享内容及分享结果接口
                wx.onMenuShareAppMessage(shareConfig);
                // 2.2 监听“分享到朋友圈”按钮点击、自定义分享内容及分享结果接口
                wx.onMenuShareTimeline(shareConfig);
                // 2.3 监听“分享到QQ”按钮点击、自定义分享内容及分享结果接口
                wx.onMenuShareQQ(shareConfig);
                // 2.4 监听“分享到微博”按钮点击、自定义分享内容及分享结果接口
                wx.onMenuShareWeibo(shareConfig);
                // 2.5 监听“分享到QZone”按钮点击、自定义分享内容及分享接口
                wx.onMenuShareQZone(shareConfig);
                // // “分享给朋友”及“分享到QQ”按钮的分享内容（1.4.0）
                // wx.updateAppMessageShareData(shareConfig);
                // // “分享到朋友圈”及“分享到QQ空间”按钮的分享内容（1.4.0）
                // wx.updateTimelineShareData(shareConfig);
            }), wx.error(err => {
                 console.log(err.message);
            }));
        },
        // 分享成功回调
        shareSuccessCb: function () {
            // alert('share success');
        },
        // 分享失败回调
        shareFailedCb: function () {
            // alert('share failed')
        }
    };
    return Promise.resolve(wxShare);
}