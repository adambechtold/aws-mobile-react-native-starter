import pandas as pd
import urllib.request
import json
import boto3
from datetime import date, timedelta

from botocore.exceptions import ClientError

TABLE = 'projectstocks_backend_stock_info'

dynamo_db = boto3.client('dynamodb')

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


def lambda_handler(event, context=None):
    # get stock info
    GOOGLE_PREFIX = 'https://www.google.com/finance/historical?output=csv&q='

    ticker = event['ticker']
    url = GOOGLE_PREFIX + ticker

    

    local_csv = '/tmp/output.csv'
    with open(local_csv, 'wb') as f:
            f.write(html)

    data = pd.read_csv(local_csv)
    data = data.iloc[::-1]

    # get rsi
    event['rsi_json'] = json.loads(rsi(data).to_json())
    last_weekday = get_last_weekday().strftime('%d-%b-%y')
    current_rsi = event['rsi_json']['rsi'][last_weekday]

    new_rating = current_rsi

    # update stock table
    try:
        update_response = dynamo_db.update_item(
            TableName=TABLE,
            Key={
                'ticker': {
                    'S': ticker
                }
            },
            ExpressionAttributeValues={
                ':rating':{
                    'N':'{}'.format(new_rating)
                }
            },
            UpdateExpression='SET current_rating=:rating',
            ReturnValues='ALL_NEW'
        )
    except ClientError as e:
        print('update unsucessful')
        print(e.response['Error']['Message'])
    else:
        print(response)

    return event