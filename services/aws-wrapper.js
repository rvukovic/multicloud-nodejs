var aws = require('aws-sdk');

aws.config.update({
  region: "eu-west-1"
});

var exports = module.exports;

exports.createBoxFileFromLocalFile = function (container, fileName, localFileName, callback) {
    var s3 = new aws.S3();
    var params = {
        Bucket: container, 
        Key: fileName, 
        Body: require('fs').createReadStream(localFileName)
    };
    s3.upload(params, callback);
};

exports.insertItem = function (tableName, key, timestamp, title, callback) {
    var documentClient = new aws.DynamoDB.DocumentClient();
    var params = {
        TableName: tableName,
        Item: {
            "key": key,
            "timestamp": timestamp,
            "title": title
        } 
    };
    documentClient.put(params, callback);
};

exports.getItemsList = function (tableName, itemLimit, callback) {
    var documentClient = new aws.DynamoDB.DocumentClient();
    var params = {
        TableName: tableName
    };
    
    documentClient.scan(params, function(err, data) {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
        }
        callback(err, data.Items.map(transformItem));
    });
    
}

function transformItem(item) {
    return {
        "url": item.key, 
        "url-transformed": item.key,
        "time": new Date(item.timestamp),
        "title": item.title 
    }
}

exports.createMessage = function (queue, messageText, callback) {
    var sqs = new aws.SQS();
    var params = {
        DelaySeconds: 10,
        MessageAttributes: {},
        MessageBody: messageText,
        QueueUrl: queue
    };

    console.log(params);

    sqs.sendMessage(params, function(err, data) {
        if (err) {
            console.log("Error", err);
        } else {
            console.log("Success", data.MessageId);
        }
        callback(err, data);
    });

    
};