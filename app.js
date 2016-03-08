var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var request = require('request');

var index = require('./routes/index');
// var trigger = require('./routes/trigger');
// var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', index);
<<<<<<< HEAD
// app.use('/trigger', trigger);
// app.use('/users', users);

// app.get('/api/comments', function(req, res) {
//   fs.readFile(COMMENTS_FILE, function(err, data) {
//     res.setHeader('Cache-Control', 'no-cache');
//     res.json(JSON.parse(data));
//   });
// });

// app.post('/api/comments', function(req, res) {
//   fs.readFile(COMMENTS_FILE, function(err, data) {
//     var comments = JSON.parse(data);
//     comments.push(req.body);
//     fs.writeFile(COMMENTS_FILE, JSON.stringify(comments, null, 4), function(err) {
//       res.setHeader('Cache-Control', 'no-cache');
//       res.json(comments);
//     });
//   });
// });
=======
>>>>>>> f51020e3760295e6826c2658e748f8fa9f70aca6

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

<<<<<<< HEAD

// setTimeout(getPointAndRecord, 1);

// function getPointAndRecord() {
//   request('https://www.codecademy.com/betaAce01707', function (error, response, html) {
//       if (!error && response.statusCode == 200) {
//           var $ = cheerio.load(html);
//           target = $('main').children().eq(3).children().first().children().first().children().eq(1).children().first().text();
//           console.log(target);
//           var now = new Date();
//           var buffer = new Buffer(now.getTime() + ' ' + target + '\n');
//           fs.open('./points_log', 'a', function(err, fd) {
//           if (err) {
//               throw 'error opening file: ' + err;
//           }
//           fs.write(fd, buffer, 0, buffer.length, null, function(err) {
//               if (err) throw 'error writing file: ' + err;
//               fs.close(fd, function() {
//                   console.log('file written');
//               })
//           });
//       });
//       }
//       else {
//           console.log(error);
//       }
//   });
//   setTimeout(getPointAndRecord, 1000 * 60 * 60 * 6);
// };



=======
>>>>>>> f51020e3760295e6826c2658e748f8fa9f70aca6
module.exports = app;
