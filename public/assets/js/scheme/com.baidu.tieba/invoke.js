/**
 * @file 贴吧调起
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
     isBaiduHi
 } from '../ua';
 const {
     execScheme
 } = require('../../mUtils');
 const {
     autoLoadInvoke
 } = require('../matrix');
import schemeConfig from '../config';
export default function invokeTiebaApp(args = {}, options = {}, cb, scope = this) {
    const pkgName = args.pkg || 'com.baidu.tieba';
    const commonData = scope.commondata || scope.$store.state.commondata;
    const source = args.source || (commonData && commonData.statistics && commonData.statistics.source) || '';
    const activityid = args.activityid || (commonData && commonData.statistics && +commonData.statistics.activityid) || 1121;
    const from = source.split('-')[0] || '';
    const pkg = source.split('-')[2] || '1022749h';
    const tiebaToken = commonData && commonData.overall.tieba_token || '';
    const appName = 'com.baidu.tieba';
    let invokeArgs = schemeConfig[appName] && schemeConfig[appName].home && schemeConfig[appName].home.params || {};
    if (args.url_key) {
        const argsOptions = args.scheme || {};
        const argsScheme = argsOptions.scheme || args.url_key || '';
        const argsParams = argsOptions.params || {};
        // 如果是贴吧端内, 直接走端能力
        if (isTieba) {
            let schemeUrl = argsScheme;
            // 调起frs
            if (/\/frs/i.test(argsScheme) && argsParams.kw) {
                schemeUrl = `https://tieba.baidu.com${isAndroid ? '/f' : ''}?kw=${argsParams.kw}&jump_tieba_native=1`;
            }
            // 调起pb
            if (/\/pb/i.test(argsScheme) && argsParams.tid) {
                schemeUrl = `https://tieba.baidu.com/f?jump_tieba_native=1&kz=${argsParams.tid}`;
            }
            // 调起H5
            if (!!/^(https?|\#)/i.test(args.url_key)) {
                // 调起视频落地页
                if (args.vid && !argsScheme) {
                    schemeUrl = `com.baidu.tieba://unidispatch/tbwebview?url=https%3A%2F%2Fhaokan.baidu.com%2Fv%3Fvid%3D${args.vid}%26pd%3D`;
                } else {
                    // 直接调起H5
                    schemeUrl = `com.baidu.tieba://unidispatch/tbwebview?url=${args.url_key}`;
                }
            }
            return schemeUrl ? execScheme(schemeUrl) : console.log('scheme is empty!', schemeUrl);
        } else {
            // 默认调起homepage-webview, 使用token方式
            invokeArgs = {
                ...invokeArgs,
                param: {
                    ...invokeArgs.param,
                    ...argsParams,
                    token: tiebaToken,
                    // h5 url默认已encodeURIComponent
                    url: args.url_key,
                    extdata: JSON.stringify({
                        "activityid": activityid,
                        "missionid": 1,
                        "activitysource": "shoubai"
                    })
                },
                androidDownUrl: 'https://downpack.baidu.com/baidutieba_AndroidPhone_' + pkg + '.apk'
            };
            let iosArgs = {
                ...invokeArgs,
                page: 'homepage'
            };
            // 调起frs
            if (/\/frs/i.test(argsScheme) && argsParams.kw) {
                // 贴吧安卓frs特殊处理逻辑, 新版发布后统一走iOS逻辑
                if (isAndroid) {
                    delete invokeArgs.param.token;
                    invokeArgs.page = 'tbwebview';
                    invokeArgs.param.url = encodeURIComponent(`https://tb1.bdstatic.com/tb/cms/redpacket/page/haokan_frs_center_page.html?kw=${argsParams.kw}`);
                } else {
                    // ios逻辑
                    delete invokeArgs.param.token;
                    delete invokeArgs.param.url;
                    invokeArgs.page = 'frs';
                    iosArgs = null;
                }
            }
            // 调起pb
            if (/\/pb/i.test(argsScheme) && argsParams.tid) {
                delete invokeArgs.param.token;
                delete invokeArgs.param.url;
                invokeArgs.page = 'pb';
                iosArgs = null;
            }
            // autoLoadInvoke('tiebaNewWakeup', '//tb1.bdstatic.com/tb/cms/redpacket/static/pkg/tiebaNewWakeup31.min.js', func => {
                // 页面初始化已加载贴吧调起库window.tiebaNewWakeup
                console.log(!!window.tiebaNewWakeup + 'invokeTiebaApp ==>' + invokeArgs.page, iosArgs, invokeArgs, commonData, args.url_key);
                !!iosArgs && window.tiebaNewWakeup ? window.tiebaNewWakeup.initDiffer(iosArgs, invokeArgs) : window.tiebaNewWakeup.init(invokeArgs);
            // });
        }
    }
}