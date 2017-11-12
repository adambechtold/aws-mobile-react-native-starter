import boto3
import json
import urllib.request
import pandas as pd

import csv
import io
import math

from datetime import datetime, date, timedelta

from apscheduler.schedulers.blocking import BlockingScheduler
from lib.dynamo_operations import exponential_backoff_update

NASDAQ_URL = 'http://www.nasdaq.com/screening/companies-by-name.aspx?letter=0&exchange=nasdaq&render=download'
NYSE_URL = 'http://www.nasdaq.com/screening/companies-by-name.aspx?letter=0&exchange=nyse&render=download'
AMEX_URL = 'http://www.nasdaq.com/screening/companies-by-name.aspx?letter=0&exchange=amex&render=download'

EXCHANGE_LIST = [NASDAQ_URL, NYSE_URL, AMEX_URL]
RATINGS_TABLE = 'projectstocks_backend_stock_info'

def get_last_weekday():
    day = date.today()
    while day.weekday() > 4: # Mon-Fri are 0-4
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
    except:
        print('could not load for ticker:', ticker, 'at url:', url)

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
    current_rsi = event['rsi_json']['rsi'][last_weekday]

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

def run():
    print('running', datetime.now())
    client = boto3.client('lambda')                                              
    ticker_set = set([])                                                         
    
    for url in EXCHANGE_LIST:                                                    
        response = urllib.request.urlopen(url)                                   
        html = response.read().decode('utf-8')                                   
        reader = csv.DictReader(io.StringIO(html))                               
        for row in reader:                                                       
            ticker_set.add(row['Symbol'])
            
    for ticker in ticker_set:
        update_stock(ticker)  

run()
scheduler = BlockingScheduler()
scheduler.add_job(run, 'interval', hours=24)
scheduler.start()
     
