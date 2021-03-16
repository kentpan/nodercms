/**
 * @file haokan scheme.config
 * Created by panjian01@baidu.com
 */
/* eslint-disable */

export default {
    baiduhaokan: {
        sfrom: 'haokanh5share',
        share: {
            ios_ver: '',
            android_ver: '',
            scheme: 'baiduhaokan://action/share/?',
            useLogin: false,
            params: {
                // title、content、image_url 和 url_key 都要 urlencode
                title: '',
                content: '',
                wbtitle: '',
                wbcontent: '',
                image_url: '',
                url_key: location.href.split('#')[0],
                // share_type: 2, // share_type 为分享类型 （ 1为新浪微博 2为微信好友 3为微信朋友圈 4为QQ平台 5为 QQ好友 6为QQ空间 7为百度hi 注意：没有share_type时调用分享面板）
                type: 0, // type 为 0为自动适配类型，1为文本、2为图片、5为URL、6为视频
                activity_type: 2,
                refresh_type: 0,
                hideitems: '', // 是需要隐藏的平台
                toastorder: '', // 需要点击弹口令的平台
                orderprameter: '', // 口令参数{“activity_id”:”xxx”,”url”:”xxx”,”order_content”:”xxx”}
                callback: 0,
                tab: '',
                tag: '',
                source: ''
            }
        },
        login: {
            ios_ver: '',
            android_ver: '',
            scheme: 'baiduhaokan://action/login/?',
            useLogin: false,
            params: {
                url_key: '',
                refresh_type: 1,
                coin: 4,
                tab: 'index',
                tag: 'sannong_new',
                source: '',
                active_id: '',
                callback: ''
            }
        },
        home: {
            ios_ver: '',
            android_ver: '',
            scheme: 'baiduhaokan://webview/?',
            useLogin: false,
            params: {
                url_key: encodeURIComponent(location.href.split('#')[0]),
                tab: 'guide',
                tag: '',
                source: '',
                swipe_back: false,
                jump: 'outer'
            }
        }
    },
    'com.baidu.tieba': {
        sfrom: 'tiebah5share',
        home: {
            ios_ver: '',
            android_ver: '',
            scheme: '',
            useLogin: false,
            params: {
                ios: "ul",
                android: "new",
                page: 'homepage', // 'tbwebview',
                param: {
                    url: encodeURIComponent(location.href.split('#')[0]), // url
                    extdata: JSON.stringify({}), // 新schema打点
                    track: '', // fe打点
                },
                download: true, // 失败后是否下载
                callManufacturer: false, // 安卓手机下是否需要调起厂商的应用商店
                iosDownUrl: 'https://itunes.apple.com/app/apple-store/id477927812?pt=328057&ct=bottom_layer&mt=8', // ios唤起失败后跳转链接
                androidDownUrl: 'https://downpack.baidu.com/baidutieba_AndroidPhone_1022749h.apk', // android 唤起失败后跳转链接
                waitTime: 1800
            }
        },
        login: {
            ios_ver: '',
            android_ver: '',
            scheme: 'invokeNative.openLoginPage',
            useLogin: false,
            params: {
                url: '',
                source: '',
                active_id: '',
                callback: ''
            }
        },
    },
    baiduboxapp: {
        sfrom: 'baiduboxapph5share',
        home: {
            ios_ver: '',
            android_ver: '',
            scheme: '',
            useLogin: false,
            params: {
                // 当home为false时，调起手百后打开的页面
                // url: '',
                // 是否调起首页，默认false
                home: false,
                // 调起的来源，用于统计，请联系 PM 分配
                from: 'openbox',
                // 中间页下载渠道号统计（仅对安卓），请联系PM分配
                channel: '',
                // ios9.0及以上，调起失败之后会跳转到该页面。默认进入下载中间页
                failUrl: 'https://itunes.apple.com/cn/app/id382201985?mt=8',
                // 安卓或 ios9.0 以下系统，调起失败会执行该函数。默认进入下载中间页
                iosForceScheme: true,
                // 安卓应用宝下载时的参数配置
                yybData: {
                    // pkg:1代表下载主板，pkg:2代表下载lite版
                    pkg: 1,
                    ckey: 'CK1417799842565'
                },
                logargs: {
                    "source": "",
                    "from": "openbox",
                    "page": "haokan_zt_activity",
                    "type": "haokan_activity",
                    "value": "",
                    "channel": ""
                },
                // 把口令参数透传给下载中间页(需要在下载中间页复制口令时用)
                // copyTokenData: {
                //     activity_id: args.activity_id,
                //     url: args.url
                // },
                // 如果设置为true，则表示不使用idmapping（即只调起主线版，不关心lite版）默认为false，即使用 idmapping(会先调起活跃版本) 。暂时只对安卓有效。
                notUseIdm: true
            }
        },
        login: {
            ios_ver: '',
            android_ver: '',
            scheme: 'baiduboxapp://account?',
            useLogin: false,
            params: {
                action: 'logindialog',
                tpl: 'yunying_4',
                login_type: 'smsOnly' | 'fast' | 'sms' | 'username' | 'wechat' | 'qq' | 'sina',
                // 是否展示第三方登录入口 1 展示 0 不展示
                showThirdLogin: '1' | '0',
                // 登录来源，对应旧版端能力的 tpl
                loginSource: 'yunying_4'
            }
        }
    },
    bdminivideo: {
        sfrom: 'minivideoh5share',
        home: {
            ios_ver: '',
            android_ver: '',
            scheme: 'bdminivideo://webview/',
            useLogin: false,
            params: {
                url_key: encodeURIComponent(location.href.split('#')[0]),
                tab: 'guide',
                tag: '',
                source: ''
            }
        },
        login: {
            ios_ver: '',
            android_ver: '',
            scheme: 'bdminivideo://utils/login?',
            useLogin: false,
            params: {
                url_key: '',
                callback: '',
                params: {
                    tab: 'guid',
                    tag: 'haokan_activity',
                    source: '',
                    active_id: '',
                    logintips: '',
                    /**
                     *  sms: 1, // 手机号
                        wechat: 2, // 微信第三方登录
                        qq: 3, // QQ第三方登录
                        sina: 4 //微博第三方登录
                     */
                    loginType: 1
                }
            }
        },
        author: {
            scheme: 'bdminivideo://author/details'
        },
        share: {
            scheme: 'bdminivideo://utils/share',
            commonH5Share: 'https://quanmin.baidu.com/sv',
            activityH5Share: 'https://quanmin.baidu.com/m/activity/share/index.html',
        },
        topic: {
            h5Topic: 'https://quanmin.baidu.com/m/cashvideo/topic'
        },
        webview: {
            scheme: 'bdminivideo://webview'
        }
    }
};