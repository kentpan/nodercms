var async = require('async');
var fs = require('fs');
var _ = require('lodash');
var os = require('os');
var path = require('path');
var moment = require('moment');
var logger = require('../../lib/logger.lib');
var themes = require('../../lib/themes.lib');
var siteInfoService = require('../services/site-info.service');
var contentService = require('../services/contents.service');
const { log } = require('console');

/**
 * 查询网站信息
 * @param {Object} req
 * @param {Object} res
 */
exports.get = function (req, res) {
  async.parallel({
    themes: themes.get,
    siteInfo: function (callback) {
      return siteInfoService.get(req, callback);
    }
  }, function (err, results) {
    if (err) {
      logger[err.type]().error(__filename, err);
      return res.status(500).end();
    }

    res.status(200).json({
      themes: results.themes,
      siteInfo: results.siteInfo
    });
  });
};
function getFullUri(req, siteInfo, cont) {
  return req.protocol + '://' + siteInfo.domain + cont.url;
}

function getXMLContent(req, siteInfo, cont) {
  return `
  <sitemap>
    <loc>
      ${req.protocol + '://' + siteInfo.domain + cont.url}
    </loc>
    <lastmod>${moment(cont.date).format('YYYY-MM-DD hh:mm:ss')}</lastmod>
  </sitemap>`;
}
function createSiteMap(siteMapFile, ext, content, len) {
  fs.stat(siteMapFile + ext, function (error) {
    console.log('fs.stat ===>', error);
    if (error) {
      fs.writeFile(siteMapFile + ext, content, function(err) {
        if (err) throw err;
        console.log('===========>', siteMapFile + ext + ' => ' + len  + '条站点地图生成！');
      });
    } else {
      fs.rename(siteMapFile + ext, siteMapFile + '-' + moment(new Date()).format('YYYYMMDDhhmmss')  + ext, (err) => {
        if (err) throw err;
        fs.writeFile(siteMapFile + ext, content, function(err) {
          if (err) throw err;
          console.log('===========>', siteMapFile + ext + ' => ' + len  + '条站点地图新生成！');
        });
      });
    }
  });
}
/**
 * 生成网站地图
 * @param {Object} req
 * @param {Object} res
 */
exports.sitemap = function (req, res) {
  var query = req.query || {};
  query.deleted = false;
  query.status = 'pushed';
  async.parallel({
      siteInfo: function (callback) {
        return siteInfoService.get(req, callback);
      },
      links: function (callback) {
        return contentService.all(query, callback);
      }
    }, function (err, results) {
    if (err) {
      logger[err.type]().error(__filename, err);
      return res.status(500).end();
    }
    var contents = results && results.links && results.links.contents;
    if (!contents || (contents && !contents.length)) {
      return res.status(200).json({
        status: 200,
        message: '获取内容列表失败'
      });
    }
    var siteInfo = {
      ...(results.siteInfo || {}),
      ...query
    };
    
    console.log('req.query ======>', req.query, siteInfo);
    contents = [
      {url: '/', date: '2021-03-15 08:48:48'},
      {url: '/news', date: '2021-03-15 08:48:48'},
      {url: '/product', date: '2021-03-15 08:48:48'}
    ].concat(contents);
    var currentDomain = (query.domain || '').replace('www.', '');
    var siteMapFile = path.resolve(__dirname, '../../public/site.' + currentDomain);
    var ext = '.txt';
    var mapList = [];
    contents.forEach(function(cont) {
      mapList.push(getFullUri(req, siteInfo, cont));
    });
    var len = mapList.length;
    // 生成.txt
    createSiteMap(siteMapFile, ext, mapList.join(os.EOL), len);

    ext = '.xml';
    mapList = [];
    contents.forEach(function(cont) {
      mapList.push(getXMLContent(req, siteInfo, cont));
    });

    mapList = `<sitemapindex>${mapList.join('')}
</sitemapindex>
    `;
    // 生成.xml
    createSiteMap(siteMapFile, ext, mapList, len);

    res.status(200).end(len + ' 条站点地图已生成！');
  });
};

/**
 * 更新网站信息
 * @param {Object} req
 *        {String} req.body.theme
 *        {String} req.body.title
 * @param {Object} res
 */
exports.update = function (req, res) {
  req.checkBody({
    'domain': {
      notEmpty: {
        options: [true],
        errorMessage: 'domain 不能为空'
      },
      isString: { errorMessage: 'domain 需为字符串' }
    },
    'theme': {
      notEmpty: {
        options: [true],
        errorMessage: 'theme 不能为空'
      },
      isString: { errorMessage: 'theme 需为字符串' }
    },
    'title': {
      notEmpty: {
        options: [true],
        errorMessage: 'title 不能为空'
      },
      isString: { errorMessage: 'title 需为字符串' }
    }
  });

  if (req.validationErrors()) {
    logger.system().error(__filename, '参数验证失败', req.validationErrors() );
    return res.status(400).end();
  }

  var data = {
    theme: req.body.theme,
    domain: req.body.domain,
    title: req.body.title,
    keywords: req.body.keywords,
    description: req.body.description,
    codeHeader: req.body.codeHeader,
    codeFooter: req.body.codeFooter,
    codeWeixin: req.body.codeWeixin,
    weixinQR: req.body.weixinQR,
    qqCode: req.body.qqCode,
    weixin: req.body.weixin,
    phoneCode: req.body.phoneCode
  };

  async.parallel([
    function (callback) {
      siteInfoService.save({
        data: data
      }, callback);
    },
    function (callback) {
      themes.set(req.app, req.body.theme, callback)
    }
  ], function (err) {
    if (err) {
      logger[err.type]().error(__filename, err);
      return res.status(500).end();
    }

    res.status(204).end();
  });
};