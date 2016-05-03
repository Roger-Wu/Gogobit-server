var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var request = require('request');
var debug = require('debug')('monitor:server');
var http = require('http');
var index = require('./routes/index');
var api = require('./routes/api');
var btcnews = require('btcnews');
var MongoClient = require('mongodb').MongoClient;
var test = require('assert');

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
app.use('/api/v0/', api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404);
  res.render('page404', {});
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

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
setTimeout(updatePostsToDatabase, 1);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
  console.log('Server is running on port: ' + addr.port);
}

function updatePostsToDatabase() {
  console.log('Update posts!');
  var sourceList = ['btclub', 'technews', 'bnext', '8btc', 'bitecoin'];
  for (var i = 0; i < sourceList.length; i++) {
    btcnews.getPosts(sourceList[i], function(err, posts) {
      MongoClient.connect('mongodb://localhost:27017/gogobit', function(err, db) {
        // Get a collection
        var collection = db.collection('postsList');
        for (var j = 0; j < posts.length; j++) {
          var filter = {
            title: posts[j].title
          }
          collection.updateMany(filter, {$set:posts[j]}, {upsert:true}, function(err, r) {
            // db.close();
          });
        }
      });
    });
  }
  setTimeout(updatePostsToDatabase, 1000 * 60 * 10);
}