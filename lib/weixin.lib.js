var session = require('express-session');
var weixinConfig = require('../config/weixin.config');
var mongoose = require('mongoose');

exports.check = function () {
  return function (req, res, next) {
    if (!mongoose.connection.name) {
      req.session = 'init';
    } else {
      if (req.session === 'init') delete req.session;
    }

    next();
  }
};

exports.init = function () {
  return session(weixinConfig);
};