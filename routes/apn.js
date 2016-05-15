var apns = require('apn');
var options = {
    cert: 'cert.pem',                 /* Certificate file path */
    key:  'key.pem',                  /* Key file path */
    gateway: 'gateway.push.apple.com',/* gateway address */
    port: 2195,                       /* gateway port */
    errorCallback: errorHappened ,    /* Callback when error occurs function(err,notification) */
}; 
function errorHappened(err, notification){
    console.log("err " + err);
}
var apnsConnection = new apns.Connection(options);

var token = "fe0ac44c7367d50bbb7a804eebb329e03c8a361d82090993bd6d15a817932b6c";
var myDevice = new apns.Device(token);
var note = new apns.Notification();
note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
note.badge = 1;
note.sound = "ping.aiff";
note.alert = "吃吃";
note.payload = {'messageFrom': 'Caroline'};
note.device = myDevice;

apnsConnection.sendNotification(note);