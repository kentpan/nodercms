var logger = require('../../lib/logger.lib');
var cache = require('../../lib/cache.lib');
var optionsModel = require('../models/options.model');

/**
 * 网站信息
 * @param {Function} callback
 */
exports.get = function (req, callback) {
  var siteInfoCache = cache.get('siteInfo');
  var domain = req.query && req.query.host || req.host;
  domain = domain.indexOf('127.0.0.1') > -1 ? 'www.yoozworld.co' : domain;
  if (!/^www\./.test(domain)) {
    domain = 'www.' + domain;
  }
  if (siteInfoCache && siteInfoCache.domain === domain) {
    console.log('host:', domain, ' siteInfoCache:', siteInfoCache);
    callback(null, siteInfoCache);
  } else {
    console.log('host:', domain, ' url:', req.url, ' query:', req.query, ' params:', req.params);
    optionsModel.findOne({ name: 'siteInfo', $or: [ { domain: domain }, { 'value.domain': domain } ] }, function (err, siteInfo) {
      if (err) {
        err.type = 'database';
        return callback(err);
      }

      if (siteInfo) {
        cache.set('siteInfo', siteInfo.value, 1000 * 60 * 60 * 24 * 30);

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
  optionsModel.findOne({ name: 'siteInfo', $or: [ { domain: options.data.domain }, { 'value.domain': options.data.domain } ] }, function (err, siteInfo) {
    if (err) {
      err.type = 'database';
      callback(err);
    }
    // 如果当前域名配置文件已经存在，则直接更新
    if (siteInfo && siteInfo.toString() !== '{}') {
      console.log('域名配置文件已存在，直接更新 =>', options.data.domain);
      optionsModel.findOneAndUpdate({ name: 'siteInfo', 'value.domain': options.data.domain }, {
        value: options.data,
        domain: options.data.domain || 'www.yoozworld.co'
      }, { runValidators: true }, function (err) {
        if (err) {
          err.type = 'database';
          callback(err);
        }

        cache.del('siteInfo');

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

        cache.del('siteInfo');

        callback(null, siteInfo);
      });

    }
  });
  // optionsModel.findOneAndUpdate({ name: 'siteInfo', domain: options.data.domain }, {
  //   value: options.data,
  //   domain: options.data.domain || 'www.yoozworld.co'
  // }, { runValidators: true }, function (err) {
  //   if (err) {
  //     err.type = 'database';
  //     callback(err);
  //   }

  //   cache.del('siteInfo');

  //   callback(null);
  // });
};