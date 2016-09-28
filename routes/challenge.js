'use strict'
var request = require('request');

const challengeUrl = 'http://linux13.csie.org:55888';

class Challenge {
	constructor (desc) {
		this.desc = desc;
	}

	getHotKeyword (callback) {
		let options = {
			url: challengeUrl + '/recommend',
			 headers: {
				 'User-Agent': '2016 YAHOO Bot Challenge!'
			 },
			method: 'GET'
		}
		request(options, function (error, response, body) {
			if (!error) {
				callback(error, body);
			}
			else {
				callback(error, body);
			}
		});
	};
	getNewsByKeyword(keyword, callback) {
		let options = {
			url: challengeUrl + '/news',
			headers: {
				'User-Agent': '2016 YAHOO Bot Challenge!'
			},
			method: 'POST',
			json: {
				keyword: keyword
			}
		}
		request(options, function (error, response, body) {
			if (!error) {
				callback(error, body);
			}
			else {
				callback(error, body);
			}
		});
	};
	getKeywordBySentence(sentence, callback) {

	};
}


var challenge = new Challenge();
module.exports = challenge;
