var logger = require('../../lib/logger.lib');
var request = require('request-promise');
var weixinConfig = require('../../config/weixin.config');
var cache = require('../../lib/cache.lib');
var SHA1 = require('./sha1.service');

/**
 * 生成随机key
 */
var getRandromKey = function () {
  var d = new Date().getTime();
  var key = "xxxxxxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
          var r = (d + Math.random() * 16) % 16 | 0;
          d = Math.floor(d / 16);
          return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
      }
  );
  return key;
}

/**
 * 网站信息
 * @param {Function} callback
 */
exports.get = async function (req, callback) {
  var weixinTokenCache = cache.get('weixinToken');
  var weixinTicketCache = cache.get('weixinTicket');
  var originUrl = req.url.split('#')[0];
  console.log('weixinTokenCache=====>',  weixinTokenCache);
  console.log('weixinTicketCache=====>', weixinTicketCache);
  if (!weixinTicketCache) {
    var params = [];
    Object.keys(weixinConfig.apis.token.params).forEach(function (k) {
      params.push(k + '=' + weixinConfig.apis.token.params[k]);
    });
    var weixinTokenApi = weixinConfig.apis.token.url + '?' + params.join('&');
    weixinTokenCache = weixinTokenCache || await request.get(weixinTokenApi).then(function (result) {
      result = JSON.parse(result);
      cache.set('weixinToken', result.access_token, (2 * 3600 - 60 * 5) * 1000);
      console.log('set weixinToken:', result);
      // logger['access']().error(__filename + '->set weixinToken: ', result.access_token);
      return result.access_token;
    }).catch(function (err) {
      // logger['access']().error(__filename + '->' + weixinTokenApi, err);
      return null;
    });
    var weixinTicketApi = weixinConfig.apis.ticket.url + '?type=' + weixinConfig.apis.ticket.params.type + '&access_token=' + weixinTokenCache;
    weixinTicketCache = await request.get(weixinTicketApi).then(function (result) {
      result = JSON.parse(result);
      cache.set('weixinTicket', result.ticket, (2 * 3600 - 60 * 5) * 1000);
      console.log('set weixinTicket:', result);
      // logger['access']().error(__filename + '->set weixinTicket: ', result.ticket);
      return result.ticket;
    }).catch(function (err) {
      // logger['access']().error(__filename + '->' + weixinTicketApi, err);
      return null;
    });
  }
  var nonceStr = getRandromKey();
  var timestamp = +new Date;
  var weixinOptions = ['jsapi_ticket=' + weixinTicketCache, 'noncestr=' + nonceStr, 'timestamp=' + timestamp, 'url=' + originUrl];
  if (!weixinTicketCache) {
    return callback(null);
  }
  console.log('SHA1: ', weixinOptions.join('&'));
  var weixinSignature = SHA1(weixinOptions.join('&'));
  callback(null, {
    errno: 0,
    msg: '',
    data: {
      appId: weixinConfig.apis.token.params.appid,
      nonceStr: nonceStr,
      timestamp: timestamp,
      signature: weixinSignature
    }
  });

    // optionsModel.findOne({ name: 'weixinToken' }, function (err, siteInfo) {
    //   if (err) {
    //     err.type = 'database';
    //     return callback(err);
    //   }

    //   if (siteInfo) {
    //     cache.set('weixinToken', siteInfo.value, 1000 * 60 * 60 * 24 * 30);

    //     callback(null, siteInfo.value);
    //   } else {
    //     callback(null);
    //   }
    // });
};

/**
 * 存储网站信息
 * @param {Object} options
 *        {Object} options.data
 * @param {Function} callback
 */
exports.save = function (options, callback) {
  optionsModel.findOneAndUpdate({ name: 'weixinToken' }, {
    value: options.data
  }, { runValidators: true }, function (err) {
    if (err) {
      err.type = 'database';
      callback(err);
    }

    cache.del('weixinToken');

    callback(null);
  });
};