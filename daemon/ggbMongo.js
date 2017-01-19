'use strict';

const MongoClient = require('mongodb').MongoClient;

const mongodbUrl = 'mongodb://gogobit:bitcoin3600@localhost:27017/gogobit';

module.exports = {
  connect: function connect(callback) {
    MongoClient.connect(mongodbUrl, (err, db) => {
      callback(err, db);
    });
  },
  promiseConnect: function promiseConnect() {
    return MongoClient.connect(mongodbUrl);
  },
};
