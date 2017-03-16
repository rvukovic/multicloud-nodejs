var azure = require('azure-storage');

var exports = module.exports;

exports.azure = azure;

var AzureBlobService = azure.createBlobService();
//exports.AzureBlobService = AzureBlobService;

var AzureQueueService = azure.createQueueService();
//exports.AzureQueueService = AzureQueueService;

var AzureTableService = azure.createTableService();
//exports.AzureTableService = AzureTableService;

exports.createBoxFileFromLocalFile = function (box, fileName, localFileName, callback) {
    return AzureBlobService.createBlockBlobFromLocalFile(box, fileName, localFileName, callback);
};

exports.getBoxFileUrl = function (box, fileName) {
    return AzureBlobService.getUrl(box, fileName);
};

exports.createMessage = function (queue, messageText, callback) {
    var msgBody = new Buffer(JSON.stringify(messageText)).toString('base64');
    return AzureQueueService.createMessage(queue, msgBody, callback);
};

exports.getItemsList = function (tableName, itemLimit, callback) {
    // var options = {
    //     payloadFormat: 'application/json;odata=nometadata'
    // };

    var query = new azure.TableQuery().top(itemLimit);

    return AzureTableService.queryEntities(tableName, query, null, null, callback);
};

exports.insertItem = function (tableName, item, callback) {
    return AzureTableService.insertEntity(tableName, item, callback);
};