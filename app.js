'use strict';

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fs = require('fs');
const request = require('request');
const debug = require('debug')('monitor:server');
const http = require('http');
const index = require('./routes/index');
const webhook = require('./routes/webhook');
const api = require('./routes/api');
const btcnews = require('btcnews');
const MongoClient = require('mongodb').MongoClient;
const test = require('assert');
const apnServer = require('./routes/apnServer');
const https = require('https');
const Bot = require('./routes/bot');
const util = require('util');
const Challenge = require('./routes/challenge');
const chatBot = require('./daemon/chat');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
// app.use('/webhook', webhook);
app.use('/api/v0/', api);

app.get('/webhook/', (req, res) => {
  if (req.query['hub.verify_token'] === 'andaler210') {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  res.status(404);
  res.render('page404', {});
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
  });
});

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

const options = {
  key: fs.readFileSync('/etc/nginx/ssl/nginx.key'),
  cert: fs.readFileSync('/etc/nginx/ssl/nginx.crt'),
  requestCert: true,
  rejectUnauthorized: false,
  // ca: [fs.readFileSync('/etc/nginx/ssl/ca.crt')]
};

const secureServer = https.createServer(options, app);
secureServer.listen(3001);
secureServer.on('error', onError);
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
  const port = parseInt(val, 10);

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

  const bind = typeof port === 'string'
    ? `Pipe ${port}`
    : `Port ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
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
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? `pipe ${addr}`
    : `port ${addr.port}`;
  debug(`Listening on ${bind}`);
  console.log(`Server is running on port: ${addr.port}`);
}

function updatePostsToDatabase() {
  console.log('Update posts!');
  const sourceList = ['technews', 'bnext', '8btc', 'bitecoin'];
  for (let i = 0; i < sourceList.length; i++) {
    console.log(`sourceList i is ${i}`);
    btcnews.getPosts(sourceList[i], (err, posts) => {
      MongoClient.connect('mongodb://localhost:27017/gogobit', (err, db) => {
        // Get a collection
        const collection = db.collection('postsList');
        for (let j = 0; j < posts.length; j++) {
          const filter = {
            title: posts[j].title,
          };
          if (posts[j].imgUrl == null) {
            posts[j].imgUrl = 'http://gogobit.com/images/icon@512.png';
          }
          collection.updateMany(filter, { $set: posts[j] }, { upsert: true }, (err, r) => {
            // db.close();
          });
        }
      });
    });
  }
  setTimeout(updatePostsToDatabase, 1000 * 60 * 10);
}

chatBot.echo();
