import pandas as pd
from datetime import datetime, timedelta, date
import json
import csv
import urllib.request

from lib.dynamo_operations import exponential_backoff_update


RATINGS_TABLE = 'projectstocks_backend_stock_info'


def get_last_weekday():
    day = date.today()
    while day.weekday() > 4:  # Mon-Fri are 0-4
        day -= timedelta(days=1)
    return day


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
    data.set_index('Date', inplace=True)
    return data


def update_stock(ticker):
    GOOGLE_PREFIX = 'https://www.google.com/finance/historical?output=csv&q='
    url = GOOGLE_PREFIX + ticker

    try:
        response = urllib.request.urlopen(url)
    except Exception as e:
        print('could not load for ticker:', ticker, 'at url:', url)
        print(e)
        return None

    html = response.read().decode('utf-8')

    local_csv = '/tmp/output.csv'
    with open(local_csv, 'w') as f:
        f.write(html)

    data = pd.read_csv(local_csv)
    data = data.iloc[::-1]

    # get rsi
    event = {}
    event['rsi_json'] = json.loads(rsi(data).to_json())
    last_weekday = get_last_weekday().strftime('%d-%b-%y')
    try:
        current_rsi = event['rsi_json']['rsi'][last_weekday]
    except:
        print('failed to get current rsi for:', ticker)
        return None

    new_rating = current_rsi

    response = exponential_backoff_update({
        'TableName': RATINGS_TABLE,
        'Key': {
            'ticker': {
                'S': ticker
            }
        },
        'ExpressionAttributeValues': {
            ':rating': {
                'N': '{}'.format(new_rating)
            }
        },
        'UpdateExpression': 'SET current_rating=:rating',
        'ReturnValues': 'ALL_NEW'
    })
