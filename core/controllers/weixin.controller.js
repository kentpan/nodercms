var async = require('async');
var fs = require('fs');
var _ = require('lodash');
var path = require('path');
var logger = require('../../lib/logger.lib');
var weixinService = require('../services/weixin.service');

/**
 * 获取微信签名
 * @param {Object} req
 * @param {Object} res
 */
exports.get = function (req, res) {
  async.parallel({
    weixinInfo: function (callback) {
      return weixinService.get(req, callback);
    }
  }, function (err, results) {
    if (err) {
      logger[err.type]().error(__filename, err);
      return res.status(500).end();
    }

    res.status(200).json(results.weixinInfo);
  });
};
