var lru = require('lru-cache');

/**
 * 缓存
 */
var options = {
  max: 0,
  maxAge: 0
};

module.exports = lru(options);