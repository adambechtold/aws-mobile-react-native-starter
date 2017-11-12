from time import sleep
import boto3
from boto3.dynamodb.conditions import Attr
from botocore.exceptions import ClientError

RETRY_EXCEPTIONS = ('ProvisionedThroughputExceededException', 'ThrottlingException')
MAX_RETRIES = 4

dynamo_db = boto3.client('dynamodb')

def exponential_backoff_update(update_kwargs):
    retries = 0
    
    while True:
        # update stock table
        try:
            update_response = dynamo_db.update_item(**update_kwargs)
        except ClientError as e:
            if e.response['Error']['Code'] not in RETRY_EXCEPTIONS or retries == MAX_RETRIES:
                raise
            print('retries={}'.format(retries))
            sleep(2 ** retries)
            retries += 1
        else:
            print(update_response)

    return update_response
