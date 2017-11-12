import boto3
import json
import urllib.request
import pandas as pd

import csv
import io

from datetime import datetime

from lib.stock_actions import update_stock
from apscheduler.schedulers.blocking import BlockingScheduler

NASDAQ_URL = 'http://www.nasdaq.com/screening/companies-by-name.aspx?letter=0&exchange=nasdaq&render=download'
NYSE_URL = 'http://www.nasdaq.com/screening/companies-by-name.aspx?letter=0&exchange=nyse&render=download'
AMEX_URL = 'http://www.nasdaq.com/screening/companies-by-name.aspx?letter=0&exchange=amex&render=download'

EXCHANGE_LIST = [NASDAQ_URL, NYSE_URL, AMEX_URL]


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
        print(ticker)
        update_stock(ticker)


run()
scheduler = BlockingScheduler()
scheduler.add_job(run, 'interval', hours=24)
scheduler.start()
