var request = require('request');

module.exports = function (context, myQueueItem) {
   
    context.log('Callback URL: ' + myQueueItem.callbackUrl);
    context.log('Request: ' + JSON.stringify(myQueueItem) );

    request.post({
        headers: {
            'content-type': 'application/json'
        },
            url: myQueueItem.callbackUrl,
            form: myQueueItem
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                context.log('Response: ' + JSON.stringify(body))
            } else {
                context.log('ERROR: ' + error);
            }
    });

    context.done();
};