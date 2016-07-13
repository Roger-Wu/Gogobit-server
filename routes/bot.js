"use strict";

var express = require('express');
var router = express.Router();
var request = require('request');
var bitcoinex = require('bitcoinex');
var fs = require('fs');
var FB = require('fb');

FB.setAccessToken('EAACEdEose0cBABSo6CiHGwfcFkiv1DgoJkJhbwZAoM1omVPhPNx0EPD1513QlTEMkKmueeirnkfhGylXHH93w9tuZBsZArMdeHPMbay37ZAAxEHOyx8rHeZBPtrbshPcOsJi43491lpgwRCYWZCvdHt3yZCVqM7OuZAqyJkTVzYI9IDQB1lx6Sk8');
var token = 'EAAIGThfZBdbIBAFT8H6rh7CInZBnfv0XxxeMc9bpvPzDAG5ZCbkK1U8UjhHzKFCHsu8o8vXHcwWqcWi5jYVUiJqkjUwepUpKCxIHOnp6ovPJx1OzpC6fvjNsPV3gkNvjv0eZBVBvJhyutc0dVwrfF757274iepBFvf4AxBPgkgZDZD';

class Bot {
  constructor(message, sender, options) {
    this.message = message;
    this.sender = sender;
    this.options = options;
  }

  response() {
    if (this.sender === '1024715390937425') {
      var text = 'Hi sir, may I help you?';
      if (/wnewpost/.test(this.message)) {
        text = this.generateFanpagePostPreview();
        this.sendTextMessage(text);
      }
      else if (/great/.test(this.message)) {
        text = 'Yeah! I think I am great!';
        this.sendTextMessage(text);
      }
      else if (/fuck/.test(this.message)) {
        text = 'You are so rude!';
        this.sendTextMessage(text);
      }
      else {
        this.sendTextMessage(text);
      }
    }
    else if (this.message.toUpperCase() === 'COINBASE' || this.message === '1') {
      var self = this;
      bitcoinex.getPriceWith('coinbase', 'usd', function(err, result) {
        if (err) {
          console.error(err);
        }
        else {
          var text = 'Coinbase 的價格資訊：\n\n當日最高價(high): ' + result.high.toFixed(2) + ' USD\n' + '當日最低價(low): ' + result.low.toFixed(2) + ' USD\n' + '最後成交價(last): ' + result.last.toFixed(2) + ' USD\n\n' + self.randomEndGreeting();
          self.sendTextMessage(text);
        }
      });
    }
    else if (this.message.toUpperCase() === 'BITSTAMP' || this.message === '2') {
      var self = this;
      bitcoinex.getPriceWith('bitstamp', 'usd', function(err, result) {
        if (err) {
          console.error(err);
        }
        else {
          var text = 'Bitstamp 的價格資訊：\n\n當日最高價(high): ' + result.high.toFixed(2) + ' USD\n' + '當日最低價(low): ' + result.low.toFixed(2) + ' USD\n' + '最後成交價(last): ' + result.last.toFixed(2) + ' USD\n\n' + self.randomEndGreeting();
          self.sendTextMessage(text);
        }
      });
    }
    else if (this.message.toUpperCase() === 'OKCOIN' || this.message === '4') {
      var self = this;
      bitcoinex.getPriceWith('okcoin', 'usd', function(err, result) {
        if (err) {
          console.error(err);
        }
        else {
          var text = 'OKcoin 的價格資訊：\n\n當日最高價(high): ' + result.high.toFixed(2) + ' USD\n' + '當日最低價(low): ' + result.low.toFixed(2) + ' USD\n' + '最後成交價(last): ' + result.last.toFixed(2) + ' USD\n\n' + self.randomEndGreeting();
          self.sendTextMessage(text);
        }
      });
    }
    else if (this.message.toUpperCase() === 'ITBIT' || this.message === '5') {
      var self = this;
      bitcoinex.getPriceWith('itbit', 'usd', function(err, result) {
        if (err) {
          console.error(err);
        }
        else {
          var text = 'itBit 的價格資訊：\n\n當日最高價(high): ' + result.high.toFixed(2) + ' USD\n' + '當日最低價(low): ' + result.low.toFixed(2) + ' USD\n' + '最後成交價(last): ' + result.last.toFixed(2) + ' USD\n\n' + self.randomEndGreeting();
          self.sendTextMessage(text);
        }
      });
    }
    else if (this.message.toUpperCase() === 'BITFINEX' || this.message === '3') {
      var self = this;
      bitcoinex.getPriceWith('bitfinex', 'usd', function(err, result) {
        if (err) {
          console.error(err);
        }
        else {
          var text = 'Bitfinex 的價格資訊：\n\n當日最高價(high): ' + result.high.toFixed(2) + ' USD\n' + '當日最低價(low): ' + result.low.toFixed(2) + ' USD\n' + '最後成交價(last): ' + result.last.toFixed(2) + ' USD\n\n' + self.randomEndGreeting();
          self.sendTextMessage(text);
        }
      });
    }
    else if (this.message.toUpperCase() === 'MAICOIN' || this.message === '6') {
      var self = this;
      bitcoinex.getBrokerPriceWith('maicoin', 'twd', function(err, result) {
        // console.log(result);
        var text = 'Maicoin 的價格資訊：\n\n賣出價(sell): ' + result.sellPrice.toFixed(2) + ' TWD\n' + '買入價(buy): ' + result.buyPrice.toFixed(2) + ' TWD\n\n' + self.randomEndGreeting();
        self.sendTextMessage(text);
      });
    }
    else if (this.message.toUpperCase() === 'BITOEX' || this.message === '7') {
      var self = this;
      bitcoinex.getBrokerPriceWith('bitoex', 'twd', function(err, result) {
        // console.log(result);
        var text = 'Bitoex 的價格資訊：\n\n賣出價(sell): ' + result.sellPrice.toFixed(2) + ' TWD\n' + '買入價(buy): ' + result.buyPrice.toFixed(2) + ' TWD\n\n' + self.randomEndGreeting();
        self.sendTextMessage(text);
      });
    }
    else if (/great/.test(this.message)) {
      var text = 'Yeah! I think I am great!';
      this.sendTextMessage(text);
    }
    else if (/fuck/.test(this.message)) {
      var text = 'You are so rude!';
      this.sendTextMessage(text);
    }
    else if (/幹/.test(this.message)) {
      var text = '你的嘴巴好臭！有刷牙嗎？';
      this.sendTextMessage(text);
    }
    else if (/幣託/.test(this.message)) {
      var text = '坑錢的 Broker，跟 Maicoin 一樣。';
      this.sendTextMessage(text);
    }
    else {
      var text = '哈囉！我是 Gogobit Bot！\n您現在可以直接向我詢問下列交易所的價格資訊喔！\n\n1. Coinbase\n2. Bitstamp\n3. Bitfinex\n4. OKcoin\n5. itBit\n6. Maicoin\n7. Bitoex\n\n只要直接對我輸入交易所名字即可！\n問我其他的我可能會看不懂，\n不過我會慢慢變聰明的！';
      this.sendTextMessage(text);
    }
    // console.log('text is:' + text);
  }

  sendTextMessage(text) {
    var messageData = {
      text:text
    };
    request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token:token},
      method: 'POST',
      json: {
        recipient: {id:this.sender},
        message: messageData,
      }
    }, function(error, response, body) {
      if (error) {
        console.log('Error sending message: ', error);
      }
      else if (response.body.error) {
        console.log('Error: ', response.body.error);
      }
    });
  }

  generateFanpagePostPreview() {
    if (!this.message.match(/title:(.+)\n/) || !this.message.match(/content:(.+)\n/) || !this.message.match(/postUrl:(.+)\n/) || !this.message.match(/footer:(.+)/)) {
      return 'Sorry, there was something wrong...';
    }
    else {
      var title = this.message.match(/title:(.+)\n/)[1];
      var content = this.message.match(/content:(.+)\n/)[1];
      var postUrl = this.message.match(/postUrl:(.+)\n/)[1];
      var footer = this.message.match(/footer:(.+)/)[1];
      var body = '【' + title + '】\n\n' + content + '\n\n\n' + footer;
      FB.api('1702805789972478/feed', 'post', { message: body , link: postUrl}, function (res) {
        if(!res || res.error) {
          console.log(!res ? 'error occurred' : res.error);
          return;
        }
        console.log('Post Id: ' + res.id);
      });
      console.log('before return!');
      return 'Sir, this is your post preview:\n\n【' + title + '】\n\n' + content + '\n\n\n' + footer; /*'\n\n And this is your post url:\n' + 'https://www.facebook.com/Gogobit2016/posts/' + res.id.split('_')[1]*/
    }
  }
  randomEndGreeting() {
    var n = Math.floor((Math.random() * 10000) + 1);
    switch(n % 7) {
      case 0:
        return '感謝您的使用！';
      case 1:
        return '歡迎下次再來～';
      case 2:
        return '祝您賺翻比特幣！';
      case 3:
        return '您看起來很有錢！';
      case 4:
        return '歡迎打賞 Gogobit:\n1KAwHcqGmvE5XAsAkrpARbAQ3hn6DWnkGC';
      case 5:
        return '請幫推薦，讓更多人來使用 Gogobit！';
      case 6:
        return '如果有任何建議，也可以直接留言喔！';
      default:
        return '謝謝！';
    }
  }

  // getShortenUrlAndPost() {
  //   request({
  //     url: 'https://www.googleapis.com/urlshortener/v1/url?key=AIzaSyAVJZQY2W5F7a-L1gwOJ_yp0SHQGDXUiR4',
  //     method: 'POST',
  //     json: {
  //       longUrl: 'https://itunes.apple.com/tw/app/gogobit/id1094365934?mt=8&ign-mpt=uo%3D4'
  //     }
  //   }, function(error, response, body) {
  //     if (error) {
  //       console.log('Error message: ', error);
  //     }
  //     else if (response.body.error) {
  //       console.log('Error: ', response.body.error);
  //     }
  //     else {
  //       var shortUrl = body.id;
  //     }
  //   });
  // }
}

var bot = new Bot();

module.exports = bot;