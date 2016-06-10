var express = require('express');
var router = express.Router();
var fs = require('fs');


router.get('/', function (req, res, next) {
  res.json({data:'yeah hook!'});
 /* if (req.query['hub.verify_token'] === 'EAAIGThfZBdbIBAKjTZAneP3ElmRr3NNOHBYZBwdOAB23unDZB5my4GMvwHzqpnPC9MJ33LEqK9ZBNIIcLsc5V1WmcG8eQy8kNsxJyll1AJtw5ZCntV0hh2f8KjvavLw0gYBboEmHaKceE16w9cdudul1zyMDrL4qBtYZBfwd4XoAgZDZD') {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
*/});

router.post('/', function (req, res) {
  messaging_events = req.body.entry[0].messaging;
  for (i = 0; i < messaging_events.length; i++) {
    event = req.body.entry[0].messaging[i];
	sender = event.sender.id;
	if (event.message && event.message.text) {
	  text = event.message.text;
	  // Handle a text message from this sender
	}
  }  
  res.sendStatus(200);
});

module.exports = router;
