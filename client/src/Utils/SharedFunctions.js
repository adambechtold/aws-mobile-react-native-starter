
const uri_prefix = 'https://www.barchart.com/stocks/quotes/'
const uri_suffix = '/interactive-chart'

const getTickerUri = (ticker) => {
    return uri_prefix + ticker + uri_suffix;
  }

module.exports = {
    getTickerUri
}