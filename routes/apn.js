'use strict';
var apn = require('apn');
var options = {
    cert: 'cert.pem',                 /* Certificate file path */
    key:  'key.pem',                  /* Key file path */
    gateway: 'gateway.push.apple.com',/* gateway address */
    port: 2195,                       /* gateway port */
    // errorCallback: errorHappened ,    /* Callback when error occurs function(err,notification) */
};

let provider = new apn.Provider({
    cert: './pem/production_cert.pem',
    key: './pem/production_key.pem',
    production: true,
});

// function errorHappened(err, notification){
//     console.log("err " + err);
// }
// var apnConnection = new apn.Connection(options);

var token = "f7d62b7afb0f4f3f35b21f8022ef06d98dceeee73ca8dd9521899c3aa593e4d1";
function getNotification(alert) {
    var note = new apn.Notification();
    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    note.badge = 1;
    note.sound = "ping.aiff";
    note.alert = alert;
    note.payload = {'messageFrom': 'Caroline'};
    note.topic = "com.company.gogobit";
    // note.device = new apn.Device(token);

    return note;
}

provider.send(getNotification('插'), token).then((response) => {
    console.log(response);
    console.log(response.failed[0].response);
});
// var myDevice = new apn.Device(token);
// var note = new apn.Notification();
// note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
// note.badge = 1;
// note.sound = "ping.aiff";
// note.alert = "吃吃";
// note.payload = {'messageFrom': 'Caroline'};
// note.device = myDevice;

// apnConnection.sendNotification(note);