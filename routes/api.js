const express = require('express');
const router = express.Router();
const request = require('request');
const MongoClient = require('mongodb').MongoClient;
const ggbMongo = require('../daemon/ggbMongo');
const assert = require('assert');
const btcnews = require('btcnews');
const chineseConv = require('chinese-conv');

const url = 'mongodb://localhost:27017/gogobit';

function getPostSourceFilter(queryCode) {
  const filteredList = [];
  for (let i = 0; i < queryCode.length; i++) {
    if (queryCode[i] === '1') {
      filteredList.push({ source: btcnews.sourceList[i].source });
    }
  }
  return filteredList;
}

router.get('/', (req, res, next) => {
  res.render('index', {});
});

router.get('/prices/average', (req, res, next) => {
    // res.writeHead(200, { 'Content-Type': 'application/json' });
  request('https://www.bitoex.com/api/v1/get_rate', (error, response, body) => {
    console.log(response.body);
  });
  const object = {};
  object.averagePrice = 302.12;
  object.title = 'test price';
  res.json(object);
});

router.get('/mongo', (req, res, next) => {
  ggbMongo.connect((err, db) => {
    assert.equal(null, err);
    console.log('Connected correctly to server');
    const collection = db.collection('test');
      // Find some documents
    collection.find({}).toArray((err, docs) => {
      assert.equal(err, null);
        // assert.equal(2, docs.length);
      console.log('Found the following records');
      console.dir(docs);
    });
      // db.close();
  });
  const object = {};
  object.averagePrice = 302.12;
  object.title = 'test price';
  res.json(object);
});

router.post('/subscrbe', (req, res, next) => {
  const object = {};
  object.email = req.body.email;
  object.address = req.body.address;
  console.dir(object);

  ggbMongo.connect((err, db) => {
    assert.equal(null, err);
    console.log('Connected correctly to server');
    const collection = db.collection('usersList');
      // Find some documents
    const query = {};
    query.email = object.email;
    console.log(`query email is ${query.email}`);
    collection.findOne(query, (err, item) => {
      assert.equal(null, err);
      console.log(item);
      if (item) {
        console.log('found!');
            // db.close();
        res.status(409).send({ error: 'object it\'s exist' });
      } else {
        console.log('not found!');
        collection.insert(object, (err, item) => {
          assert.equal(null, err);
                // db.close();
          res.status(200).send('success!');
        });
      }
    });
  });
});

router.post('/alarm/set', (req, res, next) => {
  const alarm = {};
  alarm.deviceToken = req.body.deviceToken;
  alarm.sourceName = req.body.sourceName;
  alarm.serialNumber = parseInt(req.body.serialNumber);
  alarm.price = parseFloat(req.body.price);
  alarm.priceType = req.body.priceType;
  alarm.currencyType = req.body.currencyType;
  alarm.state = req.body.state;
  alarm.desc = req.body.desc;
  console.dir(alarm);

  const filter = {
    deviceToken: alarm.deviceToken,
    serialNumber: alarm.serialNumber,
  };
  ggbMongo.connect((err, db) => {
        // Get a collection
    const collection = db.collection('alarmList');
    collection.updateMany(filter, { $set: alarm }, { upsert: true }, (err, r) => {
        // db.close();
    });
  });
  res.json(alarm.deviceToken);
});

router.post('/alarm/delete', (req, res, next) => {
  const filter = {
    deviceToken: req.body.deviceToken,
    serialNumber: parseInt(req.body.serialNumber),
  };
  ggbMongo.connect((err, db) => {
        // Get a collection
    const collection = db.collection('alarmList');

    collection.removeOne(filter, (err, r) => {
            // db.close();
      if (err) {
        res.json({ success: false, error: err, result: r });
      } else {
        res.json({ success: true, error: err, result: r });
      }
    });
  });
});

router.get('/alarm/list', (req, res, next) => {
  const filter = {
    deviceToken: req.query.deviceToken,
  };

  ggbMongo.connect((err, db) => {
    // Get a collection
    const collection = db.collection('alarmList');
    collection.find(filter).sort({ serialNumber: 1 }).toArray((err, docs) => {
      console.log(docs);
      res.json(docs);
    });
  });
});

router.get('/app/posts', (req, res, next) => {
  ggbMongo.connect((err, db) => {
        // Get a collection
    const collection = db.collection('postsList');
    collection.find().sort({ timestamp: -1 }).toArray((err, docs) => {
      res.json(docs);
    });
  });
});

router.get('/news/query', (req, res, next) => {
  const queryCode = req.query.queryCode;
  const filteredList = getPostSourceFilter(queryCode);
  if (filteredList.length == 0) {
    res.json([]);
  } else {
    ggbMongo.connect((err, db) => {
        // Get a collection
      const collection = db.collection('postsList');
      collection.find({ $or: filteredList }).sort({ timestamp: -1 }).toArray((err, docs) => {
        for (let i = 0; i < docs.length; i++) {
                    /* if (docs[i].source != 'Coindesk') {
                        docs[i]['title'] = chineseConv.tify(docs[i]['title']);
                    }*/
          if (docs[i].title === null) {
            docs[i].title = '';
            docs[i].url = 'undefined';
            docs[i].imgUrl = 'undefined';
          }
        }
                // console.log(docs);
        res.json(docs);
      });
    });
  }
});

router.get('/news/sources', (req, res, next) => {
  res.json(btcnews.sourceList);
});

module.exports = router;
