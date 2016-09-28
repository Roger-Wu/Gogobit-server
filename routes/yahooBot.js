
const token = 'EAAIGThfZBdbIBAFT8H6rh7CInZBnfv0XxxeMc9bpvPzDAG5ZCbkK1U8UjhHzKFCHsu8o8vXHcwWqcWi5jYVUiJqkjUwepUpKCxIHOnp6ovPJx1OzpC6fvjNsPV3gkNvjv0eZBVBvJhyutc0dVwrfF757274iepBFvf4AxBPgkgZDZD';

app.post('/webhook/', function (req, res) {

  var data = req.body;
  
  console.log("Recv-------------------");
  // console.log(JSON.stringify(req.body));
  
  // Make sure this is a page subscription
  if (data.object == 'page') {
    // Iterate over each entry
    // There may be multiple if batched
    data.entry.forEach(function(pageEntry) {
      var pageID = pageEntry.id;
      var timeOfEvent = pageEntry.time;
      console.log("pageID: "+pageID);

      // Iterate over each messaging event
      pageEntry.messaging.forEach(function(messagingEvent) {

        util.inspect('messagingEvent: ' + messagingEvent, false, 0);
        if (messagingEvent.optin) {
          // receivedAuthentication(messagingEvent);
        } else if (messagingEvent.message) {
          receivedMessage(messagingEvent);
        } else if (messagingEvent.delivery) {
          receivedDeliveryConfirmation(messagingEvent);
        } else if (messagingEvent.postback) {
          receivedPostback(messagingEvent);
        } else {
          console.error("Webhook received unknown messagingEvent: ", messagingEvent);
        }
      });
    });
    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know you've 
    // successfully received the callback. Otherwise, the request will time out.
  res.sendStatus(200);
  }
  // messaging_events = req.body.entry[0].messaging;
  // console.dir(messaging_events);
  // for (i = 0; i < messaging_events.length; i++) {
  //   event = req.body.entry[0].messaging[i];
  //   sender = event.sender.id;
  //   if (event.message && event.message.text) {
  //     text = event.message.text;
  //     console.log('bot!');
  //     Bot.message = text;
  //     Bot.sender = sender;
  //     console.log('user id is: ' + sender);
  //     Bot.response();
  //   }
  // }
  // res.sendStatus(200);
});

function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:", 
    senderID, recipientID, timeOfMessage);
  // console.log(JSON.stringify(message));

  var isEcho = message.is_echo;
  var messageId = message.mid;
  var appId = message.app_id;
  var metadata = message.metadata;

  // You may get a text or attachment but not both
  var messageText = message.text;
  var messageAttachments = message.attachments;
  var quickReply = message.quick_reply;


  if (isEcho) {
    // Just logging message echoes to console
    console.log("Received echo for message %s and app %d with metadata %s", 
      messageId, appId, metadata);
    return;
  } else if (quickReply) {
    var quickReplyPayload = quickReply.payload;
    console.log("Quick reply for message %s with payload %s - %s",
      messageId, quickReplyPayload, messageText);

    handleQuickReplyAction(senderID, quickReplyPayload, messageText);
    return;
  }
  
  if (messageText) {
    // If we receive a text message, check to see if it matches any special
    // keywords and send back the corresponding example. Otherwise, just echo
    // the text we received.
    switch (messageText.toLowerCase()) {
      case 'image':
        sendImageMessage(senderID);
        break;

      case 'gif':
        sendGifMessage(senderID);
        break;      

      default:
        checkResponse(senderID, messageText);
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}

function checkResponse(recipientId, messageText) {
  var hi_words = ["hi", "嗨", "嘿"];
  var dirty_words = ["幹", "靠腰", "你媽", "你妹", "操"];
  var negtive_words = ["不", "不是", "不要", "沒", "沒興趣", "no", "無聊", "還有嗎", "不想", "不好"];
  var positive_words = ["不錯", "讚", "nice", "想", "好", "嗯", "恩"];
  var dirResponseArray = [
    "這樣不好吧？！", 
    "嘴巴真臭...受不了！",
    "你媽知道你在這邊浪費生命嗎？"
  ]
  var dirResponse_sub = "好啦，回歸正題，你有想知道什麼嗎？"
  var askArray = [
    "那你有想瞭解什麼嗎？",
    "那你對哪些議題較感興趣呢？",
    "那你有想知道哪方面的事嗎？"
  ]
  var responseArray = [
    "沒問題，馬上幫你找到相關新聞", 
    "好喔，立馬幫你蒐集！", 
    "ＯＫ，請稍等我一會"
  ];
  var noIdeaArray = [
    "想不到嗎？就我對您的行為觀察，我們發現你似乎很喜歡 YAHOO，這是推薦給您的 YAHOO 相關消息！"
  ];
  var analysisArray = [
    "想不到",
    "沒想法"
  ];
  var ask_random = askArray[Math.floor(Math.random() * askArray.length)];
  var response_random = responseArray[Math.floor(Math.random() * responseArray.length)];
  var dir_random = dirResponseArray[Math.floor(Math.random() * dirResponseArray.length)];
  var no_idea_random = noIdeaArray[Math.floor(Math.random() * noIdeaArray.length)];

  console.log("negtive_words:" + new RegExp(negtive_words.join("|")).test(messageText));
  console.log("messageText:" + messageText);

  if (new RegExp(analysisArray.join("|")).test(messageText)) {
    sendTextMessage(recipientId, no_idea_random);
    sendGenericMessage(recipientId, "yahoo");
  } else if (new RegExp(dirty_words.join("|")).test(messageText)) {
    sendTextMessage(recipientId, dir_random + dirResponse_sub);
  } else if (new RegExp(negtive_words.join("|")).test(messageText)) {
    sendTextMessage(recipientId, ask_random);
  } else if (new RegExp(positive_words.join("|")).test(messageText)){
    sendTextMessage(recipientId, response_random);
    // Challenge.getNewsByKeyword(keyword, function (error, data) {})
  } else {
    sendTextMessage(recipientId, response_random);
    sendGenericMessage(recipientId, messageText);
    // Challenge.getKeyWordsBySentence(messageText, function (error, data) {
    //   sendQuickReply(recipientId, data);
    // })

  }
}

/*
 * Initially send a text message.
 *
 */

function sendHotKeywordQuickReply(recipientId) {
  Challenge.getHotKeyword(function (error, data) {
    var keywordsObj = [];
    var keywordList = JSON.parse(data)["keywords"];
    console.log("keywordList:" + keywordList);

    for(var i = 0; i < keywordList.length; i++) {
      var obj = {
        content_type: "text",
        title: keywordList[i],
        payload: "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_CHOICE"
      };

      keywordsObj.push(obj);
      console.log("keywordsObj:" + keywordsObj);
    } 

    var obj = {
      content_type: "text",
      title: "都沒有",
      payload: "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_NO"
    };
    keywordsObj.push(obj);

    var messageData = {
      recipient: {
        id: recipientId
      },
      message: {
        text: "這些是最近熱門的新聞關鍵字，有對哪個比較感興趣嗎？",
        metadata: "DEVELOPER_DEFINED_METADATA",
        quick_replies: keywordsObj
      }
    };

    callSendAPI(messageData);
  });
}

function initialTextMessage(recipientId) {
  sendTextMessage(recipientId, "Hi, 我是Y主播，有想什麼知道的新聞都可以問我喔！");
  sendHotKeywordQuickReply(recipientId);
  // Challenge.getHotKeyword(function (error, data) {
  //   var keywords = '';
  //   var keywordList = JSON.parse(data)["keywords"];
  //   console.log("keywordList:" + keywordList);

  //   // console.log('keywordListaaaaaaaaaaaaaa: ' + keywordList);
  //   var title = "Hi, 我是Y主播，有想什麼知道的新聞都可以問我喔！\n\n"
  //   for(var i=0; i<keywordList.length; i++) {
  //     if(i == 0) {
  //       keywords = keywordList[i];
  //       console.log(keywordList[i]);
  //     }
  //     else {
  //       keywords = keywords + ", " + keywordList[i];
  //       console.log(keywordList[i]);
  //     }
  //   }
  //   var message = "「" + keywords + "」這些是最近熱門的新聞關鍵字，有對哪個比較感興趣嗎？";
  //   console.log(title + message);
  //   sendTextMessage(recipientId, title + message);
  // });
}

/*
 * Send a text message using the Send API.
 *
 */
function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a Structured Message (Generic Message type) using the Send API.
 *
 */
function sendGenericMessage(recipientId, keyword) {
  //uuuu
  console.log("sendGenericMessage:" + keyword);
  Challenge.getNewsByKeyword(keyword, function (error, data) {
    // var dataNews = JSON.parse(data)["news"];
    var dataNews = data["news"];
    console.log("News:" + dataNews);

    if(dataNews.length == 0) {
      sendTextMessage(recipientId, "很抱歉目前找不到相關新聞！");
      sendHotKeywordQuickReply(recipientId);
    } else {
      var newsList = [];
      for(var i = 0; i < dataNews.length; i++) {
        if(i > 9) {
          break;
        } else {
          var obj = {
            title: dataNews[i].title,
            subtitle: "新聞",
            item_url: dataNews[i].newsUrl,               
            image_url: dataNews[i].imgUrl,
            buttons: [{
              type: "web_url",
              url: dataNews[i].newsUrl,
              title: "查看新聞"
            }, {
              type: "postback",
              title: "沒興趣",
              payload: "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_NO"
            }]
          };
        }

        newsList.push(obj);
      } 

      var messageData = {
        recipient: {
          id: recipientId
        },
        message: {
          attachment: {
            type: "template",
            payload: {
              template_type: "generic",
              elements: newsList
            }
          }
        }
      };

      callSendAPI(messageData);
    }
  });
}

/*
 * check payload to handle quick reply
 *
 **/
function handleQuickReplyAction(senderID, quickReplyPayload, messageText) {
  switch (quickReplyPayload) {
      case "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_YES":
        checkResponse(senderID, "好");
        break;
      case "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_NO":
        console.log("button response:" + messageText);
        checkResponse(senderID, "沒興趣");
        break;
      case "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_CHOICE":
        // sendTextMessage(senderID, "你是想找「"+messageText+"」嗎？");
        console.log("CHOICEEEEEEEEEEEEE!!!");
        sendGenericMessage(senderID, messageText);
        break;
      default:
        checkResponse(senderID, "不");
        break;
    }
}

/*
 * Call the Send API. The message data goes in the body. If successful, we'll 
 * get the message id in a response 
 *
 */
function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: token},
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", 
        messageId, recipientId);
      // sendTypingOff(recipientId);
    } else {
      console.error("Unable to send message.");
      // console.error(response);
      // console.error(error);
    }
  });  
}

/*
 * Postback Event
 *
 * This event is called when a postback is tapped on a Structured Message. 
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/postback-received
 * 
 */
function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback 
  // button for Structured Messages. 
  var payload = event.postback.payload;
  console.log(event);
  console.log("Received postback for user %d and page %d with payload '%s' " + 
    "at %d", senderID, recipientID, payload, timeOfPostback);

  // When a postback is called, we'll send a message back to the sender to 
  // let them know it was successful
  switch (payload) {
    case "PAYLOAD_GET_STARTED":
      initialTextMessage(senderID);
      break;
    case "POSTBACK_QUICK_REPLY":
      handleQuickReplyAction(senderID, payload, text);
      console.log('fuck right!!!');
      break;
    case "POSTBACK_HOT_KEY":
      sendHotKeywordQuickReply(senderID);
      break;
    case "POSTBACK_HOT_NEWS":
      // get();
      sendTextMessage(senderID, "晚點再跟你說！");
      break;

    // case "POSTBACK_GIF":
    //   sendGifMessage(senderID);
    //   break;
    // case "POSTBACK_BUTTON":
    //   sendButtonMessage(senderID);
    //   break;

    default:
      checkResponse(senderID, "不");
      break;
  }
  
}

/*
 * Send a read receipt to indicate the message has been read
 *
 */
function sendReadReceipt(recipientId) {
  console.log("Sending a read receipt to mark message as seen");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "mark_seen"
  };

  callSendAPI(messageData);
}

/*
 * Turn typing indicator on
 *
 */
function sendTypingOn(recipientId) {
  console.log("Turning typing indicator on");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_on"
  };

  callSendAPI(messageData);
}

/*
 * Turn typing indicator off
 *
 */
function sendTypingOff(recipientId) {
  console.log("Turning typing indicator off");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_off"
  };

  callSendAPI(messageData);
}

/*
 * Authorization Event
 *
 * The value for 'optin.ref' is defined in the entry point. For the "Send to 
 * Messenger" plugin, it is the 'data-ref' field. Read more at 
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/authentication
 *
 */
function receivedAuthentication(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfAuth = event.timestamp;

  // The 'ref' field is set in the 'Send to Messenger' plugin, in the 'data-ref'
  // The developer can set this to an arbitrary value to associate the 
  // authentication callback with the 'Send to Messenger' click event. This is
  // a way to do account linking when the user clicks the 'Send to Messenger' 
  // plugin.
  var passThroughParam = event.optin.ref;

  console.log("Received authentication for user %d and page %d with pass " +
    "through param '%s' at %d", senderID, recipientID, passThroughParam, 
    timeOfAuth);

  // When an authentication is received, we'll send a message back to the sender
  // to let them know it was successful.
  sendTextMessage(senderID, "Authentication successful");
}

/*
 * Delivery Confirmation Event
 *
 * This event is sent to confirm the delivery of a message. Read more about 
 * these fields at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-delivered
 *
 */
function receivedDeliveryConfirmation(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var delivery = event.delivery;
  var messageIDs = delivery.mids;
  var watermark = delivery.watermark;
  var sequenceNumber = delivery.seq;

  if (messageIDs) {
    messageIDs.forEach(function(messageID) {
      console.log("Received delivery confirmation for message ID: %s", 
        messageID);
    });
  }

  console.log("All message before %d were delivered.", watermark);
}