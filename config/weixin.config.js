var session = require('express-session');
var mongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');

module.exports = {
  appid: 'wx106d2c2ef561f166',
  secret: 'c7e701e5fe606eddb3a34cda9d62b002',
  name: 'yoozwebsiteWXTOKEN',
  token: '',
  expire: 2 * 3600 - 5 * 60,
  lastTime: '',
  cookie: {
    httpOnly: true
  },
  store: new mongoStore({
    mongooseConnection: mongoose.connection
  }),
  resave: false,
  saveUninitialized: false
};