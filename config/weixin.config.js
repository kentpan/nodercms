module.exports = {
  name: 'weixinToken',
  apis: {
    token: {
      url: 'https://api.weixin.qq.com/cgi-bin/token',
      params: {
        grant_type: 'client_credential',
        appid: 'wx106d2c2ef561f166',
        secret: 'c7e701e5fe606eddb3a34cda9d62b002'
      }
    },
    ticket: {
      url: 'https://api.weixin.qq.com/cgi-bin/ticket/getticket',
      params: {
        type: 'jsapi',
        access_token: ''
      }
    }
  },
  lastTime: ''
};