'use strict';

const AWS = require('aws-sdk');
var http = require('http');
var url=require('url');

const SQS = new AWS.SQS({ apiVersion: '2012-11-05' });
const Lambda = new AWS.Lambda({ apiVersion: '2015-03-31' });


// Your queue URL stored in the queueUrl environment variable
const QUEUE_URL = process.env.queueUrl;
const PROCESS_MESSAGE = 'process-message';


function invokePoller(functionName, message) {
    const payload = {
        operation: PROCESS_MESSAGE,
        message,
    };
    const params = {
        FunctionName: functionName,
        InvocationType: 'Event',
        Payload: new Buffer(JSON.stringify(payload)),
    };
    return new Promise((resolve, reject) => {
        Lambda.invoke(params, (err) => (err ? reject(err) : resolve()));
    });
}


function processMessage(message, callback) {
    console.log(message);
    
    var bodyJson = JSON.parse(message.Body);
    var callbackUrl = bodyJson.callbackUrl;
    var port = url.parse(callbackUrl).port;
    var host = url.parse(callbackUrl).hostname;
    var path = url.parse(callbackUrl).pathname;
    console.log('Hostname: ', host, ' Path: ', path);
    bodyJson.funcBounce = new Date();
    var resultJson = JSON.stringify(bodyJson);
    
    var http = require('http')

    var str = '';
    
    var request = new http.ClientRequest({
        hostname: host,
        path: path,
        port: port,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(resultJson)
        }
    }, (response)=>{
        response.on('data', function (chunk) {
              str += chunk;
        });
        response.on('end', function () {
              console.log(str);
          callback(null, str);
        });
    });
    
    request.end(resultJson);

    // delete message
    const params = {
        QueueUrl: QUEUE_URL,
        ReceiptHandle: message.ReceiptHandle,
    };
    SQS.deleteMessage(params, (err) => callback(err, message));
}

function poll(functionName, callback) {
    const params = {
        QueueUrl: QUEUE_URL,
        MaxNumberOfMessages: 10,
        VisibilityTimeout: 10,
    };
    // batch request messages
    SQS.receiveMessage(params, (err, data) => {
        if (err) {
            return callback(err);
        }
        // for each message, reinvoke the function
        if(data.Messages) {
            const promises = data.Messages.map((message) => invokePoller(functionName, message));
            // complete when all invocations have been made
            Promise.all(promises).then(() => {
                const result = `Messages received: ${data.Messages.length}`;
                console.log(result);
                callback(null, result);
            });
        } else {
            callback(null, null);
        }
    });
}

exports.handler = (event, context, callback) => {
    try {
        if (event.operation === PROCESS_MESSAGE) {
            // invoked by poller
            processMessage(event.message, callback);
        } else {
            // invoked by schedule
            poll(context.functionName, callback);
        }
    } catch (err) {
        callback(err);
    }
};
