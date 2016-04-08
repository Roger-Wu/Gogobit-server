var express = require('express');
var router = express.Router();
var request = require('request');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var btcnews = require('btcnews');

var url = 'mongodb://localhost:27017/gogobit';

router.get('/', function (req, res, next) {
	res.render('index', {});
});

router.get('/prices/average', function (req, res, next) {
	// res.writeHead(200, { 'Content-Type': 'application/json' });
	request('https://www.bitoex.com/api/v1/get_rate', function (error, response, body) {
		console.log(response.body);
	});
	var object = {};
	object.averagePrice = 302.12;
	object.title = 'test price';
	res.json(object);
});

router.get('/mongo', function (req, res, next) {

	MongoClient.connect(url, function(err, db) {
	  assert.equal(null, err);
	  console.log("Connected correctly to server");
	  var collection = db.collection('test');
	  // Find some documents 
	  collection.find({}).toArray(function(err, docs) {
	    assert.equal(err, null);
	    // assert.equal(2, docs.length);
	    console.log("Found the following records");
	    console.dir(docs);
	  });

	  // db.close();
	});

	var object = {};
	object.averagePrice = 302.12;
	object.title = 'test price';
	res.json(object);
});

router.post('/subscrbe', function (req, res, next) {
	var object = {};
	object.email = req.body.email;
	object.address = req.body.address;
	console.dir(object);

	MongoClient.connect(url, function(err, db) {
	  assert.equal(null, err);
	  console.log("Connected correctly to server");
	  var collection = db.collection('usersList');
	  // Find some documents 
	  var query = {};
	  query['email'] = object.email;
	  console.log('query email is ' + query['email']);
	  collection.findOne(query, function(err, item) {
		assert.equal(null, err);
		console.log(item);
		if (item) {
			console.log('found!');
			// db.close();
			res.status(409).send({error:'object it\'s exist'});
		}
		else {
			console.log('not found!');
			collection.insert(object, function(err, item) {
				assert.equal(null, err);
				// db.close();
				res.status(200).send('success!');
			})
		}
	  });
	});
});

router.get('/app/posts', function (req, res, next) {
	btcnews.getPosts(null, function(err, posts) {
		res.json(posts);
	});
});

module.exports = router;
