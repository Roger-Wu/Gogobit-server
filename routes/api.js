'use strict';

const express = require('express');
const ggbMongo = require('../daemon/ggbMongo');
const btcnews = require('btcnews');

const router = express.Router();

function getPostSourceFilter(queryCode) {
  const filteredList = [];
  for (let i = 0; i < queryCode.length; i += 1) {
    if (queryCode[i] === '1') {
      filteredList.push({ source: btcnews.sourceList[i].source });
    }
  }
  return filteredList;
}

router.get('/', (req, res) => {
  res.render('index', {});
});

router.get('/prices/average', (req, res) => {
  const object = {};
  object.averagePrice = 302.12;
  object.title = 'test price';
  res.json(object);
});

router.post('/alarm/set', (req, res) => {
  const alarm = {
    deviceToken: req.body.deviceToken,
    sourceName: req.body.sourceName,
    serialNumber: parseInt(req.body.serialNumber, 10),
    price: parseFloat(req.body.price),
    priceType: req.body.priceType,
    currencyType: req.body.currencyType,
    state: req.body.state,
    desc: req.body.desc,
  };
  const filter = {
    deviceToken: alarm.deviceToken,
    serialNumber: alarm.serialNumber,
  };
  ggbMongo.connect((connectError, db) => {
    if (connectError) {
      console.error(`connectError:${connectError}`);
    } else {
      const collection = db.collection('alarmList');
      collection.updateMany(filter, { $set: alarm }, { upsert: true }, (updateError, r) => {
        if (updateError) {
          console.error(`updateError:${updateError}`);
          res.status(555).json({ error: 'Update error', message: updateError });
          db.close();
        } else {
          console.log(`update alarm successfully, result:${r}`);
          res.json(alarm.deviceToken);
          db.close();
        }
      });
    }
  });
});

router.post('/alarm/delete', (req, res) => {
  const filter = {
    deviceToken: req.body.deviceToken,
    serialNumber: parseInt(req.body.serialNumber, 10),
  };
  ggbMongo.connect((connectError, db) => {
    if (connectError) {
      console.error(`connectError:${connectError}`);
    } else {
      const collection = db.collection('alarmList');
      collection.removeOne(filter, (removeError, r) => {
        if (removeError) {
          console.error(`removeError:${removeError}`);
          res.json({ success: false, error: removeError, result: r });
          db.close();
        } else {
          res.json({ success: true, error: null, result: r });
          db.close();
        }
      });
    }
  });
});

router.get('/alarm/list', (req, res) => {
  const filter = { deviceToken: req.query.deviceToken };
  ggbMongo.connect((connectError, db) => {
    if (connectError) {
      console.error(`connectError:${connectError}`);
    } else {
      const collection = db.collection('alarmList');
      collection.find(filter).sort({ serialNumber: 1 }).toArray((findError, docs) => {
        if (findError) {
          console.error(`findError:${findError}`);
          db.close();
        } else {
          res.json(docs);
          db.close();
        }
      });
    }
  });
});

router.get('/app/posts', (req, res) => {
  ggbMongo.connect((connectError, db) => {
    if (connectError) {
      console.error(`connectError:${connectError}`);
    } else {
      const collection = db.collection('postsList');
      collection.find().sort({ timestamp: -1 }).toArray((findError, docs) => {
        if (findError) {
          console.error(`findError:${findError}`);
          db.close();
        } else {
          res.json(docs);
          db.close();
        }
      });
    }
  });
});

router.get('/news/query', (req, res) => {
  const queryCode = req.query.queryCode;
  const filteredList = getPostSourceFilter(queryCode);
  if (filteredList.length === 0) {
    res.json([]);
  } else {
    ggbMongo.connect((connectError, db) => {
      if (connectError) {
        console.error(`connectError:${connectError}`);
      } else {
        const collection = db.collection('postsList');
        const query = { $or: filteredList };
        const sortOption = { timestamp: -1 };
        collection.find(query).sort(sortOption).toArray((findError, docs) => {
          if (findError) {
            console.error(`findError:${findError}`);
            db.close();
          } else {
            const posts = [];
            for (let i = 0; i < docs.length; i += 1) {
              if (docs[i].title != null) posts.push(docs[i]);
            }
            res.json(posts);
            db.close();
          }
        });
      }
    });
  }
});

router.get('/news/sources', (req, res) => {
  res.json(btcnews.sourceList);
});

module.exports = router;
