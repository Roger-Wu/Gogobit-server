var apns = require('apn');
var bitcoinex = require('bitcoinex');
var MongoClient = require('mongodb').MongoClient;

var options = {
    cert: './routes/pem/cert.pem',                 /* Certificate file path */
    key:  './routes/pem/key.pem',                  /* Key file path */
    gateway: 'gateway.sandbox.push.apple.com',/* gateway address */
    port: 2195,                       /* gateway port */
    errorCallback: errorHappened ,    /* Callback when error occurs function(err,notification) */
};

var nameTable = {
	maicoin: 'Maicoin',
	bitoex: 'Bitoex'
};

var apnsConnection = new apns.Connection(options);

function errorHappened(err, notification){
    console.log("err " + err);
}

function checkBrokerPriceRepeatly() {
	var brokerList = ['maicoin', 'bitoex'];
	for (var i = 0; i < brokerList.length; i++) {
		bitcoinex.getBrokerPriceWith(brokerList[i], 'twd', function(err, brokerPriceObject) {
			console.log(brokerPriceObject);
			var filter = {
		        sourceName: brokerPriceObject.source
		    }
		    // console.log(filter);
		    MongoClient.connect('mongodb://localhost:27017/gogobit', function(err, db) {
		    // Get a collection
		    var collection = db.collection('alarmList');
		    collection.find(filter).toArray(function(err, alarmList) {

		            for (var j = 0; j < alarmList.length; j++) {
		            	var isSend = checkAlarmTrigger(alarmList[j], brokerPriceObject);
		            	if (alarmList[j].state === 'onetime' && isSend) {
		            		collection.updateOne(alarmList[j], {$set:{state: 'off'}});
		            	}
		            }
		            // res.json(alarmList);
		        });
		    });
			// console.log(parseInt(brokerPriceObject['buy_price']));
		});
	}
	setTimeout(checkBrokerPriceRepeatly, 1000 * 10);
}


// var token = "329ccb543abdbcf15ac5af2aed43aba0f265b65314a20f1ead319fef795c0e36";
// var myDevice = new apns.Device(token);

function checkAlarmTrigger(alarm, brokerPriceObject) {
	if (alarm.state === 'off') {
		return false;
	}
	if (alarm.priceType === 'buy') {
		// console.log('if!');
		if (parseFloat(brokerPriceObject.buyPrice) < parseFloat(alarm.price)) {
			var alertMessage = '現在 ' + brokerPriceObject.source + ' 買價已低於 ' + alarm.price + ' 可以進場了！';
			apnsConnection.sendNotification(getNote(alertMessage, alarm.deviceToken));
			console.log('send!');
			return true;
		}
	}
	if (alarm.priceType === 'sell') {
		// console.log('if!');
		if (parseFloat(brokerPriceObject.sellPrice) > parseFloat(alarm.price)) {
			var alertMessage = '現在 ' + brokerPriceObject.source + ' 賣價已超過 ' + alarm.price + ' 可以出場了！';
			apnsConnection.sendNotification(getNote(alertMessage, alarm.deviceToken));
			console.log('send!');
			return true;
		}
	}
	return false;
}

function getNote(alert, token) {
	var note = new apns.Notification();
	note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
	note.badge = 1;
	note.sound = "ping.aiff";
	note.alert = alert;
	note.payload = {'messageFrom': 'Caroline'};
	note.device = new apns.Device(token);

	return note;
}

// "現在正是搬磚套利的好時機!";

// apnsConnection.sendNotification(note);
// console.log('after send push notification!');
// checkBrokerPriceRepeatly();