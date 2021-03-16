const Clipboard = require('clipboard');
const {
    matrixApp
} = require('../matrix');
/**
 * 手百内好看
 */
 /* eslint-disable */
let downloading = false;
let clipInstance = null;
let downloaduri = '';
// 创建剪贴板
function creatClipboard (text, selector, event) {
    clipInstance && clipInstance.destroy();
    const cb = new Clipboard(selector, {
        text: () => text
    });
    cb.on('success', (e) => {
        console.log('success', e, text);
        cb.off('error')
        cb.off('success')
    });
    cb.on('error', (e) => {
        console.log('error', e, text);
        cb.off('error')
        cb.off('success')
    });
    // event && cb.onClick(event);
    return cb;
}
// 注册进度条
function registerProcess(args) {
    const {
        appName = 'baiduhaokan',
        pkgName = 'com.baidu.haokan'
    } = args;
    let downingTimer = null;
    let random = ~~(Math.random() * 10) + 10;
     // 进度条回调函数
    window.__downingCallback = function (action, data) {
        downingTimer && clearTimeout(downingTimer);
         data = typeof data === 'string' ? JSON.parse(data) : data;
         let state = data.data;
         let process = parseInt(state.process, 10);
         random = ~~(Math.random() * 20) + 20;
         let mockProcess = 0;
         console.log(appName + '__downingCallback__process=>', process, random);
         if (process <= random) {
             mockProcess = random > mockProcess ? random : mockProcess;
         } else if (process < 100) {
             mockProcess = process;
         } else if (process >= 100) {
             mockProcess = 100;
             // 当次记录已下载的安装包uri
             downloaduri = state.uri;
             let t = setTimeout(function () {
                clearTimeout(t);
                let unregisterScheme = `baiduboxapp://v5/datachannel/unregister?action=com.baidu.channel.aladdin.downloadapk&page=${appName}download`;
                window.location.href = unregisterScheme;
                downloading = false;
                delete window.__downingCallback;
             }, 1000);
         }
         window.__shoubaiDownloadProcessBar__ && window.__shoubaiDownloadProcessBar__({
             process: mockProcess
         });
    };
    downingTimer = setTimeout(() => {
        downingTimer && clearTimeout(downingTimer);
        console.log(appName + '__downingCallback__mock=>', random, downloading);
        window.__shoubaiDownloadProcessBar__ && window.__shoubaiDownloadProcessBar__({
            process: random
        });
        downingTimer = setTimeout(() => {
            console.log(appName + '__downingCallback__mock_complete=>', 100);
            downloaduri = 'downloaduri';
            downloading = false;
            window.__shoubaiDownloadProcessBar__ && window.__shoubaiDownloadProcessBar__({
                process: 100
            });
        }, 8000);
    }, 500);
    let registerScheme = `baiduboxapp://v5/datachannel/register?action=com.baidu.channel.aladdin.downloadapk&page=${appName}download&jscallback=__downingCallback`;
    window.location.href = registerScheme;
    downloading = true;
}
// 调起手百安装端能力
function installApk(uri, apk = 'com.baidu.haokan') {
    console.log('installApk', uri);
    window.__installCallback__ = function (data) {
        data = JSON.parse(data) || {};
        // 调起安装失败，就重新下载~
        console.log(data);
        var status = data.status;
        if (+status !== 0) {
            downloaduri = '';
            shoubaiDownload();
        }
    };
    var installScheme = 'baiduboxapp://v14/download/app?params=';
    var params = {
        type: 'installapk',
        business: 'baiduhaokan_activity',
        uri: uri || '',
        packageName: apk,
        callback: '__installCallback__'
    };
    downloading = false;
    window.location.href = installScheme + encodeURIComponent(JSON.stringify(params));
}
// 手百端能力下载
function shoubaiDownload(args, cb) {
    const {
        appName = 'baiduhaokan',
        source,
        pkgUrl = ''
    } = args;
    console.log('shoubaiDownload=>' + source + '|||' + matrixApp('v'));
     if (parseFloat(matrixApp('v')) >= 10.0) {
        let apk = source.split('-')[2] || '';
        let pkgurl = pkgUrl || '//cdn-haokanapk.baidu.com/haokanapk/apk/baiduhaokan' + apk + '.apk';
        let params = {
             type: 'startdownload',
             business: appName + '_zt',
             url: encodeURI(pkgurl),
             uri: '',
             file_id: apk || '1021079n',
             callback: '__downloadCallback__'
        };
        if (!downloading) {
            let dlscheme = 'baiduboxapp://v14/download/app?upgrade=1&params=' + encodeURIComponent(JSON.stringify(params));
            location.href = dlscheme;
        }
     }
}
 // 判断 Android 手机是否安装好看/各矩阵 APP
function checkHaokanApp(args) {
    return new Promise((resolve, reject) => {
        let timer = null;
        window.__checkDownloadCallback = function (result = '{}') {
            timer && clearTimeout(timer);
            result = typeof result === 'string' ? JSON.parse(result) : result;
            console.log('checkHaokanApp=>', result);
            if (result && +result.status === 0) {
                // result.data.result 值为0 代表已安装，值为1代表未安装，值为-1 参数错误 值为2无法判断是否安装
                if (result.data && +result.data.result === 0) {
                    resolve({
                        errno: 0,
                        msg: 'success'
                    });
                } else {
                    resolve({
                        errno: 1,
                        msg: 'fail'
                    });
                }
            } else {
                resolve({
                    errno: 1,
                    msg: 'fail'
                });
            }
        };
        let params = {
            pkg: args.pkgName || 'com.baidu.haokan'
        };
        let checkScheme = 'baiduboxapp://v16/utils/queryScheme?callback=__checkDownloadCallback&params=' + encodeURIComponent(JSON.stringify(params));
        location.href = checkScheme;
        timer = setTimeout(function () {
            let isInvoke = document.hidden || document.webkitHidden;
            let status = !downloaduri ? 1 : 0;
            if (!isInvoke) {
                window.__checkDownloadCallback({
                    status: status,
                    data: {
                        result: status
                    }
                });
            }
        }, 1000);
    });
}
// 执行手百安装
function invokeBaiduDownload(args, cb) {
    const {
        pkgName = 'com.baidu.haokan'
    } = args;
    // 如本次已下载, 则直接调起安装端能力, 不重复下载
    if (!!downloaduri) {
        console.log('goto installAPK=>', args);
        installApk(downloaduri, pkgName);
    } else {
        console.log('goto shoubaiDownload=>', args);
        // 走手百端能力下载
        shoubaiDownload(args, cb);
        // 注册下载进度
        registerProcess(args);
    }
}
// 手百安装端能力下载入口
export default function NaDownloader(args = {}, cb) {
    if (!!downloading) {
        return;
    }
    const {
        appName = 'baiduhaokan',
        selector = '',
        event,
        scheme = '',
        source,
        pkgUrl = '',
        pkgName = 'com.baidu.haokan',
        force = false
    } = args;
    if (!!force) {
        return invokeBaiduDownload(args, cb);
    }
    if (event) {
        clipInstance = creatClipboard(`#${scheme}#`, selector, event);
        clipInstance && event && clipInstance.onClick(event);
    }
    return checkHaokanApp(args).then(ret => {
        // 已安装, 直接走cb走好看调起库
        if (ret && ret.errno === 0) {
            clipInstance && clipInstance.destroy();
            cb && cb();
        } else {
            // 如本次已下载, 则直接调起安装端能力, 不重复下载
            return invokeBaiduDownload(args, cb);
        }
    });
};