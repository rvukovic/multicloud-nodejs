var azure = require('azure-storage');

var exports = module.exports;

exports.azure = azure;

var AzureBlobService = azure.createBlobService();
//exports.AzureBlobService = AzureBlobService;

var AzureQueueService = azure.createQueueService();
//exports.AzureQueueService = AzureQueueService;

var AzureTableService = azure.createTableService();
//exports.AzureTableService = AzureTableService;

exports.createBoxFileFromLocalFile = function (container, blob, localFileName, callback) {
    return AzureBlobService.createBlockBlobFromLocalFile(container, blob, localFileName, callback);
};

exports.createMessage = function (queue, messageText, callback) {
    var msgBody = new Buffer(JSON.stringify(messageText)).toString('base64');    
    return AzureQueueService.createMessage(queue, msgBody, callback);
};

exports.getItemsList = function (tableName, itemLimit, callback) {
    var options = {
        payloadFormat: 'application/json;odata=nometadata'
    };
    
     var query = new azure.TableQuery().top(itemLimit);

     return AzureTableService.queryEntities(tableName, query, null, options, callback);   
};

exports.insertItem = function (tableName, item, callback) {
    return AzureTableService.insertEntity(tableName, item, callback);
};