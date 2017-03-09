var azure = require('azure-storage');

var exports = module.exports;


var AzureBlobService = azure.createBlobService();;
exports.AzureBlobService = AzureBlobService;

var AzureQueueService = azure.createQueueService();
exports.AzureQueueService = AzureQueueService;


exports.createBoxFileFromLocalFile = function (container, blob, localFileName, optionsOrCallback, callback) {
  return AzureBlobService.createBlockBlobFromLocalFile(container, blob, localFileName, optionsOrCallback, callback);
};

exports.createMessage = function (queue, messageText, callback) {
  return AzureQueueService.createMessage(queue, messageText, callback);
}