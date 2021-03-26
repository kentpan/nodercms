/**
 * siteInfoController
 */
angular.module('controllers').controller('siteInfo', ['$scope', '$http', 'account',
  function ($scope, $http, account) {
    'use strict';

    /**
     * 初始化变量
     */
    $scope.transmitting = true;
    $scope.domains = [];
    $scope.domain = '';
    $scope.themes = [];
    $scope.theme = '';
    $scope.title = '';
    $scope.keywords = '';
    $scope.description = '';
    $scope.codeHeader = '';
    $scope.codeFooter = '';
    $scope.codeWeixin = '';
    $scope.weixinQR = '';
    $scope.qqCode = '';
    $scope.weixin = '';
    $scope.phoneCode = '';
    $scope.editAuth = false;
    $scope.readAuth = false;
    $scope.defaultDomain = 'www.yooz.org.cn';
    var currentIndex = 0;
    var domainList = [
      {
        name: 'www.yooz.org.cn',
        value: 'www.yooz.org.cn'
      },
      {
        name: 'www.yoozworld.co',
        value: 'www.yoozworld.co'
      },
      {
        name: 'www.yooz.ren',
        value: 'www.yooz.ren'
      },
      {
        name: 'www.yooz.net.cn',
        value: 'www.yooz.net.cn'
      }
    ];
    for (var index = 0; index < domainList.length; index++) {
      if ($scope.website.hostname.indexOf(domainList[index].name) > -1) {
        currentIndex = index;
      }
      if ($scope.defaultDomain.indexOf(domainList[index].name) > -1) {
        domainList[index].name = domainList[index].name + ' - [默认域名]'
      }
    }
    domainList = domainList.splice(currentIndex, 1).concat(domainList);

    /**
     * 读取用户编辑权限以及返回读取当前单页
     */
    account.auths()
      .then(function (auths) {
        $scope.editAuth = auths.siteInfo.edit;
        $scope.readAuth = auths.siteInfo.read;
      }, function () {
        $scope.$emit('notification', {
          type: 'danger',
          message: '读取权限失败'
        });
      });

    /**
     * 获取网站配置
     */
    $scope.getInfoWithDomain = function () {
      var domain = $scope.domain || location.hostname;
      domain = /127\.0\.0\.1|39\.103\.156\.189/.test(domain) ? $scope.defaultDomain : domain;
      if (!/^www\./.test(domain)) {
        domain = 'www.' + domain;
      }
      domain = domain.replace(/\:\d+\/?$/, '');

      $http.get('/api/site-info', {
        params: {
          host: domain
        }
      })
        .success(function (result) {
          console.log($scope.domain, result);
          $scope.themes = result.themes;
          $scope.theme = result.siteInfo.theme || 'default';
          $scope.domains = domainList;
          $scope.domain = $scope.domain || result.siteInfo.domain || $scope.website.hostname || $scope.defaultDomain;
          $scope.title = result.siteInfo.title;
          $scope.keywords = result.siteInfo.keywords;
          $scope.description = result.siteInfo.description;
          $scope.codeHeader = result.siteInfo.codeHeader;
          $scope.codeFooter = result.siteInfo.codeFooter;
          $scope.codeWeixin = result.siteInfo.codeWeixin;
          $scope.weixinQR = result.siteInfo.weixinQR;
          $scope.qqCode = result.siteInfo.qqCode;
          $scope.weixin = result.siteInfo.weixin;
          $scope.phoneCode = result.siteInfo.phoneCode;

          $scope.transmitting = false;
        })
        .error(function () {
          $scope.$emit('notification', {
            type: 'danger',
            message: '获取网站配置失败'
          });
        });
    }
    $scope.getInfoWithDomain();
    /**
     * 更新网站配置
     */
    $scope.submitSiteInfo = function () {
      $scope.transmitting = true;

      $http.put('/api/site-info', {
        theme: $scope.theme,
        domain: $scope.domain,
        title: $scope.title,
        keywords: $scope.keywords,
        description: $scope.description,
        codeHeader: $scope.codeHeader,
        codeFooter: $scope.codeFooter,
        codeWeixin: $scope.codeWeixin,
        weixinQR: $scope.weixinQR,
        qqCode: $scope.qqCode,
        weixin: $scope.weixin,
        phoneCode: $scope.phoneCode
      })
      .success(function () {
        $scope.transmitting = false;

        $scope.$emit('notification', {
          type: 'success',
          message: '网站配置已保存'
        });
      })
      .error(function () {
        $scope.transmitting = false;

        $scope.$emit('notification', {
          type: 'danger',
          message: '网站配置保存失败'
        });
      });
    };
  }
]);