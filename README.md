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
```

Web site should be avalable on http://localhost:3000
