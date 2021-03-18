var lru = require('lru-cache');

/**
 * 缓存
 */
var options = {
  max: 0,
  maxAge: 2 * 3600 - 60 * 5
};

module.exports = lru(options);