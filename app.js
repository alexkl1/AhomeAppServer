const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const indexRouter = require('./routes/index');
const snapshotRouter = require('./routes/snapshot');
//const usersRouter = require('./routes/users');
const helmet = require("helmet");
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// serve static files
console.log("dirname: ",__dirname);
app.use(express.static(__dirname+'/static', { dotfiles: 'allow' }))

//app.use(logger('dev'));
app.use(logger(function (tokens, req, res) {
  return [
    new Date().toISOString(),
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms'
  ].join(' ')
}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet());
app.use('/', indexRouter);
app.use('/snapshot', snapshotRouter);

// catch 404 and forward to error handler
/*app.use(function(req, res, next) {
  next(createError(404));
});*/

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  console.log("Error: ",err);

  //res.render('error');
});
console.log("AhomeApp backend started");
/*app.listen(3000, function() {
  console.log("Server is running on port " + 3000);
});*/
module.exports = app;
