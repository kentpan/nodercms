var async = require('async');
var _ = require('lodash');
var siteInfoService = require('../services/site-info.service');
var categoriesService = require('../services/categories.service');
var listsService = require('../services/lists.service');
var featuresService = require('../services/features.service');

/**
 * 首页
 * @param {Object} req
 * @param {Object} res
 */
module.exports = function (req, res) {
  async.parallel({
    siteInfo: function (callback) {
      return siteInfoService.get(req, callback);
    },
    navigation: function (callback) {
      categoriesService.navigation({ current: '/' }, callback);
    },
    features: featuresService.all,
    lists: listsService.all,
    readingTotal: function (callback) {
      listsService.reading({path: '/news'}, callback);
    },
    // readingDay: function (callback) {
    //   listsService.reading({ sort: '-reading.day' }, callback);
    // },
    // readingWeek: function (callback) {
    //   listsService.reading({ sort: '-reading.week' }, callback);
    // },
    readingMonth: function (callback) {
      listsService.reading({ path: '/news', sort: '-reading.month' }, callback);
    },
    readingProdTotal: function (callback) {
      listsService.reading({path: '/product'}, callback);
    },
    readingProdMonth: function (callback) {
      listsService.reading({ path: '/product', sort: '-reading.month' }, callback);
    }
  }, function (err, results) {
    if (err) return res.status(500).end();
    res.render('home', {
      layout: 'layout-default',
      siteInfo: results.siteInfo,
      navigation: results.navigation,
      features: results.features,
      lists: results.lists,
      readingList: {
        total: results.readingTotal,
        // day: results.readingDay,
        // week: results.readingWeek,
        month: results.readingMonth,
        prodTotal: results.readingProdTotal,
        prodMonth: results.readingProdMonth
      }
    });
  });
};