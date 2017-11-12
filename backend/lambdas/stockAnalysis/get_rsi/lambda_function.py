import pandas as pd
import urllib.request
import json

def rsi(data, window_length=14):
    close = data['Close']
    delta = close.diff()
    delta = delta[1:] 

    up, down = delta.copy(), delta.copy()
    up[up < 0] = 0
    down[down > 0] = 0

    # Calculate the SMA
    roll_up2 = pd.rolling_mean(up, window_length)
    roll_down2 = pd.rolling_mean(down.abs(), window_length)

    # Calculate the RSI based on SMA
    RS2 = roll_up2 / roll_down2
    RSI2 = 100.0 - (100.0 / (1.0 + RS2))
    data['rsi'] = RSI2
    rsi_data = pd.concat([RSI2, data['Date']], axis=1)
    print(data)
    data.set_index('Date', inplace=True)
    return data


def lambda_handler(event, context=None):
    GOOGLE_PREFIX = 'https://www.google.com/finance/historical?output=csv&q='

    ticker = event['ticker']
    url = GOOGLE_PREFIX + ticker

    response = urllib.request.urlopen(url)
    html = response.read()

    local_csv = '/tmp/output.csv'
    with open(local_csv, 'wb') as f:
            f.write(html)

    data = pd.read_csv(local_csv)
    data = data.iloc[::-1]
    event['rsi_json'] = json.loads(rsi(data).to_json())
    return event

lambda_handler({'ticker': 'AAPL'})