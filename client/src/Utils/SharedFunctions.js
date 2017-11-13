
const chart_uri_prefix = 'https://www.barchart.com/stocks/quotes/'
const chart_uri_suffix = '/interactive-chart'

let { AlphaVantageKey } = require('./secrets')

const getTickerChartUri = (ticker) => {
  return chart_uri_prefix + ticker + chart_uri_suffix;
}

const getCurrentPrice = (ticker) => {
  alpha_api_call = 'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&interval=5min&symbol=' + ticker + '&apikey=' + AlphaVantageKey + '&outputsize=compact';
  console.log('getting current price')
  return new Promise((resolve, reject) => {
    fetch(alpha_api_call)
      .then((response) => response.json())
      .then(function (data) {

        date_list = Object.keys(data['Time Series (5min)']).map((e) => e)
        latest_date = date_list.reduce((a, b) => a > b ? a : b)
        console.log('returning price')
        resolve(data['Time Series (5min)'][latest_date].close)
      })
  });

  console.log('function complete')
}

module.exports = {
  getTickerChartUri,
  getCurrentPrice
}