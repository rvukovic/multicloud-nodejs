# multicloud-nodejs
Simple PoC to demonstrate Multi cloud approach by using AWS and Azure 

Preparation
```
   > npm install bower gulp -g
   > npm install
   > bower install
```

Starting the server
```
   > gulp serve
```

The following enviroment variables must exist or alternative, file '.env' must be created in the root folder with the following keys:

```
AZURE_STORAGE_ACCOUNT = ''
AZURE_STORAGE_ACCESS_KEY = ''

CLOUD_SERVICE = 'azure' # or 'aws'

MESSAGE_QUEUE_NAME = '' SQS or Azure Queue
BOX_STORAGE_NAME_IN = '' # 'S3 / Blob Name In
BOX_STORAGE_NAME_OUT = '' # S3 / Blob Name Out
TABLE_STORAGE_NAME = '' # 'Azure Table / DynamoDB table'
IMAGE_PROCESS_WEBHOOK = '' # Webhook URL
```

Web site should be avalable on http://localhost:3000
