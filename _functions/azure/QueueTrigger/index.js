var request = require('request');

module.exports = function (context, myQueueItem) {
   
    context.log('PartitionKey: ' + myQueueItem.PartitionKey);

    request.post({
        headers: {
            'content-type': 'application/json'
        },
        url: 'http://nodeapp01-dev.azurewebsites.net/api/processImage',
        form: myQueueItem
    }, function (error, response, body) {

        if (!error && response.statusCode == 200) {
            context.log('RECEIVED: ' + body)
        } else {
            context.log(error);
        }
    });

    context.done();
};