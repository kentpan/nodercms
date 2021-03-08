var session = require('express-session');
var mongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');

module.exports = {
  secret: 'yoozwebsite',
  name: 'yoozwebsiteSid',
  cookie: {
    httpOnly: false
  },
  store: new mongoStore({
    mongooseConnection: mongoose.connection
  }),
  resave: false,
  saveUninitialized: false
};