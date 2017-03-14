'use strict';

const apns = require('apn');
const bitcoinex = require('bitcoinex');
const ggbMongo = require('../daemon/ggbMongo');

function errorHappened(err, notification) {
  console.log(`err: ${err}, notification: ${notification}`);
}

const options = {
  cert: './routes/pem/production_cert.pem',
  key: './routes/pem/production_key.pem',
  gateway: 'gateway.push.apple.com',
  port: 2195,
  errorCallback: errorHappened,
};

const apnsConnection = new apns.Connection(options);

function isPersistentTrigger(remain) {
  return remain === undefined || remain < 1 || isNaN(remain);
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

function checkAlarmTrigger(alarm, brokerPriceObject) {
  if (alarm.deviceToken === 'simulator' || alarm.state === 'off') {
    return false;
  } else if (alarm.state === 'persistent') {
    console.log('in persistent!');
    if (isPersistentTrigger(alarm.persistentRemain)) {
      if (alarm.priceType === 'buy') {
        console.log('if buy!');
        if (parseFloat(brokerPriceObject.buyPrice) < parseFloat(alarm.price)) {
          const alertMessage = `現在 ${brokerPriceObject.source} 買價已低於 ${alarm.price} 可以進場了！`;
          apnsConnection.sendNotification(getNote(alertMessage, alarm.deviceToken));
          console.log('if buy send!');
          return true;
        }
      } else if (alarm.priceType === 'sell') {
        console.log('if sell!');
        if (parseFloat(brokerPriceObject.sellPrice) > parseFloat(alarm.price)) {
          const alertMessage = `現在 ${brokerPriceObject.source} 賣價已超過 ${alarm.price} 可以出場了！`;
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
      if (parseFloat(brokerPriceObject.buyPrice) < parseFloat(alarm.price)) {
        const alertMessage = `現在 ${brokerPriceObject.source} 買價已低於 ${alarm.price} 可以進場了！`;
        apnsConnection.sendNotification(getNote(alertMessage, alarm.deviceToken));
        return true;
      }
    } else if (alarm.priceType === 'sell') {
      if (parseFloat(brokerPriceObject.sellPrice) > parseFloat(alarm.price)) {
        const alertMessage = `現在 ${brokerPriceObject.source} 賣價已超過 ${alarm.price} 可以出場了！`;
        apnsConnection.sendNotification(getNote(alertMessage, alarm.deviceToken));
        return true;
      }
    }
  }
  return false;
}

function updateAlarmState(alarm, operation) {
  ggbMongo.connect((connectError, db) => {
    if (connectError) console.error(`connectError:${connectError}`);
    else {
      const collection = db.collection('alarmList');
      collection.updateOne(alarm, operation, (updateError, result) => {
        if (updateError) {
          console.error(`updateError:${updateError}`);
        } else {
          console.log(`Update alarm result:${result}`);
        }
        db.close();
      });
    }
  });
}

function checkBrokerPriceRepeatly() {
  console.log('checkBrokerPriceRepeatly!');
  const brokerList = ['maicoin', 'bitoex'];
  for (let i = 0; i < brokerList.length; i += 1) {
    bitcoinex.getBrokerPriceWith(brokerList[i], 'twd', (getPriceError, brokerPriceObject) => {
      if (getPriceError) console.error(`getPriceError:${getPriceError}`);
      else {
        const filter = { sourceName: brokerPriceObject.source };
        ggbMongo.connect((connectError, db) => {
          if (connectError) console.error(`connectError:${connectError}`);
          else {
            const collection = db.collection('alarmList');
            collection.find(filter).toArray((findError, alarmList) => {
              if (findError) {
                console.error(`findError:${findError}`);
              } else {
                for (let j = 0; j < alarmList.length; j += 1) {
                  const isSend = checkAlarmTrigger(alarmList[j], brokerPriceObject);
                  if (alarmList[j].state === 'onetime' && isSend) {
                    updateAlarmState(alarmList[j], { $set: { state: 'off' } });
                  } else if (alarmList[j].state === 'persistent' && isSend) {
                    updateAlarmState(alarmList[j], { $set: { persistentRemain: 60 } });
                  } else if (alarmList[j].state === 'persistent' && !isSend) {
                    if (alarmList[j].persistentRemain < 0 || isNaN(alarmList[j].persistentRemain)) {
                      updateAlarmState(alarmList[j], { $set: { persistentRemain: 60 } });
                    } else {
                      const remain = alarmList[j].persistentRemain - 1;
                      updateAlarmState(alarmList[j], { $set: { persistentRemain: remain } });
                    }
                  }
                }
              }
              db.close();
            });
          }
        });
      }
    });
  }
  setTimeout(checkBrokerPriceRepeatly, 1000 * 15);
  return 0;
}

module.exports = {
  checkBrokerPriceRepeatly,
};
