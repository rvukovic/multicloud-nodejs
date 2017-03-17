var request = require('request');

module.exports = function (context, myQueueItem) {

    context.log('Callback URL: ' + myQueueItem.callbackUrl);
    context.log('Request: ' + JSON.stringify(myQueueItem));

    request.post({
        url: myQueueItem.callbackUrl,
        json: myQueueItem,
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            context.log('Response: ' + JSON.stringify(body))
        } else {
            context.log('ERROR: ' + JSON.stringify(error));
            context.log('Response: ' + JSON.stringify(body))
            context.log('Response code: ' + response.statusCode);
        }
    });

    context.done();
};