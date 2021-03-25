var logger = require('../../lib/logger.lib');
var cache = require('../../lib/cache.lib');
var optionsModel = require('../models/options.model');

const defaultDomain = 'www.yooz.org.cn';

function getDomain (req) {
  var domain = (req.query && req.query.host) || req.domain || req.headers.host || defaultDomain;
  domain = domain.indexOf('127.0.0.1') > -1 ? defaultDomain : domain;
  if (!/^www\./.test(domain)) {
    domain = 'www.' + domain;
  }
  domain = domain.replace(/\:\d+$/, '');
  return domain;
}
/**
 * 网站信息
 * @param {Function} callback
 */
exports.get = function (req, callback) {
  var domain = getDomain(req);
  var siteInfoCache = cache.get('siteInfo_' + domain);
  if (siteInfoCache) {
    console.log('host:', domain, 'siteInfoCache.domain:', siteInfoCache.domain, ' siteInfoCache:', siteInfoCache);
    callback(null, siteInfoCache);
  } else {
    console.log('host:', domain, ' query:', req.query, ' params:', req.params);
    optionsModel.findOne({ name: 'siteInfo', $or: [ { domain: domain }, { 'value.domain': domain } ] }, function (err, siteInfo) {
      if (err) {
        err.type = 'database';
        return callback(err);
      }

      if (siteInfo) {
        cache.set('siteInfo_' + domain, siteInfo.value, 1000 * 60 * 60 * 24 * 30);

        callback(null, siteInfo.value);
      } else {
        callback(null, {});
      }
    });
  }
}

/**
 * 存储网站信息
 * @param {Object} options
 *        {Object} options.data
 * @param {Function} callback
 */
exports.save = function (options, callback) {
  var domain = getDomain(options.data);
  optionsModel.findOne({ name: 'siteInfo', $or: [ { domain: domain }, { 'value.domain': domain } ] }, function (err, siteInfo) {
    if (err) {
      err.type = 'database';
      callback(err);
    }
    // 如果当前域名配置文件已经存在，则直接更新
    if (siteInfo && siteInfo.toString() !== '{}') {
      console.log('域名配置文件已存在，直接更新 =>', domain);
      optionsModel.findOneAndUpdate({ name: 'siteInfo', 'value.domain': domain }, {
        value: options.data,
        domain: domain || defaultDomain
      }, { runValidators: true }, function (err) {
        if (err) {
          err.type = 'database';
          callback(err);
        }

        cache.del('siteInfo_' + domain);

        callback(null);
      });
    } else {
      // 如果当前域名配置文件不存在，则新建
      console.log('域名配置文件不存在，新增配置项 =>', options.data.domain);
      new optionsModel({ name: 'siteInfo', domain: options.data.domain, value: options.data }).save(function (err, siteInfo) {
        if (err) {
          err.type = 'database';
          callback(err);
        }

        cache.del('siteInfo_' + domain);

        callback(null, siteInfo);
      });

    }
  });
  // optionsModel.findOneAndUpdate({ name: 'siteInfo', domain: options.data.domain }, {
  //   value: options.data,
  //   domain: options.data.domain || defaultDomain
  // }, { runValidators: true }, function (err) {
  //   if (err) {
  //     err.type = 'database';
  //     callback(err);
  //   }

  //   cache.del('siteInfo_' + domain);

  //   callback(null);
  // });
};