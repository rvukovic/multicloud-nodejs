var azure = require('azure-storage');

var exports = module.exports;

var AzureBlobService = azure.createBlobService();
var AzureQueueService = azure.createQueueService();
var AzureTableService = azure.createTableService();

exports.createBoxFileFromLocalFile = function (box, fileName, localFileName, callback) {
    return AzureBlobService.createBlockBlobFromLocalFile(box, fileName, localFileName, function (error, result, response) {
        return callback(error, {
            url: AzureBlobService.getUrl(box, fileName)
        } /*, result, response */);    
    });
};

exports.createMessage = function (queue, messageText, callback) {
    var msgBody = new Buffer(JSON.stringify(messageText)).toString('base64');
    return AzureQueueService.createMessage(queue, msgBody, callback);
};

exports.getItemsList = function (tableName, itemLimit, callback) {
    var query = new azure.TableQuery().top(itemLimit);

    return AzureTableService.queryEntities(tableName, query, null, null, function (error, result, response) {
        return callback(error, response.body.value);
    });
};

exports.insertItem = function (tableName, item, callback) {
    return AzureTableService.insertEntity(tableName, item, callback);
};