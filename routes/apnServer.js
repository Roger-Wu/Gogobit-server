const apns = require('apn');
const bitcoinex = require('bitcoinex');
const ggbMongo = require('../daemon/ggbMongo');
const MongoClient = require('mongodb').MongoClient;

const options = {
  cert: './routes/pem/production_cert.pem',                 /* Certificate file path */
  key: './routes/pem/production_key.pem',                  /* Key file path */
  gateway: 'gateway.push.apple.com', /* gateway address */
  port: 2195,                       /* gateway port */
  errorCallback: errorHappened,    /* Callback when error occurs function(err,notification) */
};

const nameTable = {
  maicoin: 'Maicoin',
  bitoex: 'Bitoex',
};

const apnsConnection = new apns.Connection(options);

function errorHappened(err, notification) {
  console.log(`err ${err}`);
}

function checkBrokerPriceRepeatly() {
  const brokerList = ['maicoin', 'bitoex'];
  for (let i = 0; i < brokerList.length; i++) {
    bitcoinex.getBrokerPriceWith(brokerList[i], 'twd', (err, brokerPriceObject) => {
            // console.log(brokerPriceObject);
      const filter = {
        sourceName: brokerPriceObject.source,
      };
            // console.log(filter);
      ggbMongo.connect((err, db) => {
            // Get a collection
        const collection = db.collection('alarmList');
        collection.find(filter).toArray((err, alarmList) => {
          for (let j = 0; j < alarmList.length; j++) {
            const isSend = checkAlarmTrigger(alarmList[j], brokerPriceObject);
            if (alarmList[j].state === 'onetime' && isSend) {
              collection.updateOne(alarmList[j], { $set: { state: 'off' } });
            } else if (alarmList[j].state === 'persistent' && isSend) {
              collection.updateOne(alarmList[j], { $set: { persistentRemain: 60 } });
            } else if (alarmList[j].state === 'persistent' && !isSend) {
              if (alarmList[j].persistentRemain < 0 || isNaN(alarmList[j].persistentRemain)) {
                collection.updateOne(alarmList[j], { $set: { persistentRemain: 60 } });
              } else {
                const remain = alarmList[j].persistentRemain - 1;
                                // console.log('remain is: ' + remain);
                collection.updateOne(alarmList[j], { $set: { persistentRemain: remain } });
              }
            }
          }
                    // res.json(alarmList);
        });
      });
            // console.log(parseInt(brokerPriceObject['buy_price']));
    });
  }
  setTimeout(checkBrokerPriceRepeatly, 1000 * 15);
}


// var token = "329ccb543abdbcf15ac5af2aed43aba0f265b65314a20f1ead319fef795c0e36";
// var myDevice = new apns.Device(token);

function checkAlarmTrigger(alarm, brokerPriceObject) {
  if (alarm.state === 'off') {
    return false;
  } else if (alarm.state === 'persistent') {
    console.log('in persistent!');
    if (alarm.persistentRemain === undefined || alarm.persistentRemain < 1 || isNaN(alarm.persistentRemain)) {
      if (alarm.priceType === 'buy') {
        console.log('if buy!');
        if (parseFloat(brokerPriceObject.buyPrice) < parseFloat(alarm.price)) {
          var alertMessage = `現在 ${brokerPriceObject.source} 買價已低於 ${alarm.price} 可以進場了！`;
          apnsConnection.sendNotification(getNote(alertMessage, alarm.deviceToken));
          console.log('if buy send!');
          return true;
        }
      }
      if (alarm.priceType === 'sell') {
        console.log('if sell!');
        if (parseFloat(brokerPriceObject.sellPrice) > parseFloat(alarm.price)) {
          var alertMessage = `現在 ${brokerPriceObject.source} 賣價已超過 ${alarm.price} 可以出場了！`;
          apnsConnection.sendNotification(getNote(alertMessage, alarm.deviceToken));
          console.log('sell send!');
          return true;
        }
      }
    } else {
      return false;
    }
  } else if (alarm.state === 'onetime') {
    if (alarm.priceType === 'buy') {
                // console.log('if!');
      if (parseFloat(brokerPriceObject.buyPrice) < parseFloat(alarm.price)) {
        var alertMessage = `現在 ${brokerPriceObject.source} 買價已低於 ${alarm.price} 可以進場了！`;
        apnsConnection.sendNotification(getNote(alertMessage, alarm.deviceToken));
                // console.log('send!');
        return true;
      }
    }
    if (alarm.priceType === 'sell') {
            // console.log('if!');
      if (parseFloat(brokerPriceObject.sellPrice) > parseFloat(alarm.price)) {
        var alertMessage = `現在 ${brokerPriceObject.source} 賣價已超過 ${alarm.price} 可以出場了！`;
        apnsConnection.sendNotification(getNote(alertMessage, alarm.deviceToken));
                // console.log('send!');
        return true;
      }
    }
  }
  return false;
}

function getNote(alert, token) {
  const note = new apns.Notification();
  note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
  note.badge = 1;
  note.sound = 'ping.aiff';
  note.alert = alert;
  note.payload = { messageFrom: 'Caroline' };
  note.device = new apns.Device(token);

  return note;
}

// "現在正是搬磚套利的好時機!";

// apnsConnection.sendNotification(note);
// console.log('after send push notification!');
checkBrokerPriceRepeatly();
