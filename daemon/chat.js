'use strict';

const login = require('facebook-chat-api');
const bitcoinex = require('bitcoinex');
const request = require('request');

const THREAD_ID = '449917831858633'; // Bitcoin chat box thread id.
// Create simple echo bot

let previousPrice = 0.0;

function checkPricePer5Minutes(api) {
  if (previousPrice === 0.0) {
    bitcoinex.getPriceWith('bitfinex', 'usd', (getPriceError, result) => {
      if (getPriceError) console.error(`getPriceError:${getPriceError}`);
      else {
        previousPrice = parseFloat(result.last);
        setTimeout(() => checkPricePer5Minutes(api), 1000 * 5); // per 5 minutes checking.
      }
    });
  } else {
    bitcoinex.getPriceWith('bitfinex', 'usd', (getPriceError, result) => {
      if (getPriceError) {
        console.error(`getPriceError:${getPriceError}`);
      } else if (previousPrice !== 0.0) {
        const currentPrice = parseFloat(result.last);
        const delta = currentPrice - previousPrice;
        previousPrice = currentPrice;
        if (Math.abs(delta) > 10.0) {
          const text = `當前價格 ${currentPrice} USD\n5 分鐘內價格變化 ${delta.toFixed(2)} USD\n超過 10 USD，當心啦！`;
          api.sendMessage(text, THREAD_ID);
          console.log(`sent:${text}`);
        }
        console.log(`delta:${delta}, currentPrice:${currentPrice}`);
      }
      setTimeout(() => checkPricePer5Minutes(api), 1000 * 60 * 5); // per 5 minutes checking.
    });
  }
}

const echo = () => {
  login({ email: 'andaler210@gmail.com', password: '2915b6559a7f55096bb71702315e1dd5' }, (err, api) => {
    if (err) {
      setInterval(echo, 1000 * 10);
      return console.error(err);
    }
    checkPricePer5Minutes(api);
    api.listen((listenError, message) => {
      if (!listenError) {
        if (/\/coinbase/.test(message.body)) {
          bitcoinex.getPriceWith('coinbase', 'usd', (getPriceError, result) => {
            if (!getPriceError) {
              const text = `Coinbase 的價格資訊：\n\n當日最高價(high): ${result.high.toFixed(2)} USD\n當日最低價(low): ${result.low.toFixed(2)} USD\n最後成交價(last): ${result.last.toFixed(2)} USD`;
              api.sendMessage(text, message.threadID);
            } else {
              console.error(getPriceError);
            }
          });
        } else if (/\/maicoin/.test(message.body)) {
          bitcoinex.getBrokerPriceWith('maicoin', 'twd', (getPriceError, result) => {
            if (!getPriceError) {
              const text = `Maicoin 的價格資訊：\n\n賣出價(sell): ${result.sellPrice.toFixed(2)} TWD\n買入價(buy): ${result.buyPrice.toFixed(2)} TWD`;
              api.sendMessage(text, message.threadID);
            } else {
              console.error(getPriceError);
            }
          });
        } else if (/\/bitfinex/.test(message.body)) {
          bitcoinex.getPriceWith('bitfinex', 'usd', (getPriceError, result) => {
            if (!getPriceError) {
              const text = `Bitfinex 的價格資訊：\n\n當日最高價(high): ${result.high.toFixed(2)} USD\n當日最低價(low): ${result.low.toFixed(2)} USD\n最後成交價(last): ${result.last.toFixed(2)} USD`;
              api.sendMessage(text, message.threadID);
            } else {
              console.error(getPriceError);
            }
          });
        } else if (/\/eth/.test(message.body)) {
          request('https://api.coinbase.com/v2/prices/ETH-USD/spot', (error, response, body) => {
            if (error) console.error(`error:${error}`);
            else {
              const text = `Coinbase 的 ETH 最新成交價：${JSON.parse(body).data.amount} ${JSON.parse(body).data.currency}`;
              api.sendMessage(text, message.threadID);
            }
          });
        }
        console.log(message, null, 4);
      }
    });
    return 0;
  });
};

// echo();

module.exports = {
  echo,
};
