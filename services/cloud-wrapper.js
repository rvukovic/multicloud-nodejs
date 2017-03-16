var azureService = require('./azure-wrapper');
var awsService = require('./aws-wrapper');

var exports = module.exports;

var _cloudSrv;

exports.azure = azureService.azure;
exports.aws = awsService.aws;

var CloudName = process.env['CLOUD_SERVICE'];
exports.CloudName = CloudName;

var BoxNameIn = process.env['BOX_STORAGE_NAME_IN'];
exports.BoxNameIn = BoxNameIn;

var BoxNameOut = process.env['BOX_STORAGE_NAME_OUT'];
exports.BoxNameOut = BoxNameOut;

var MessageQueueName = process.env['MESSAGE_QUEUE_NAME'];
exports.MessageQueueName = MessageQueueName;

var TableName = process.env['TABLE_STORAGE_NAME'];
exports.TableName = TableName;


exports.initCloudService = function () {
    switch (CloudName) {
        case 'azure':
            _cloudSrv = azureService;
            console.log('Selecting Azure as cloud service');
            break;
        case 'aws':
            _cloudSrv = awsService;
            console.log('Selecting AWS as cloud service');
            break;
    }
};


exports.createBoxFileFromLocalFile = function (box, fileName, localFileName, callback) {
    return _cloudSrv.createBoxFileFromLocalFile(box, fileName, localFileName, callback);
};

exports.getBoxFileUrl = function (box, fileName) {
    return _cloudSrv.getBoxFileUrl(box, fileName);
};

exports.createMessage = function (queue, messageText, callback) {
    return _cloudSrv.createMessage(queue, messageText, callback);
};

exports.getItemsList = function (tableName, itemLimit, callback) {
    return _cloudSrv.getItemsList(tableName, itemLimit, callback);
};

exports.insertItem = function (tableName, item, callback) {
    return _cloudSrv.insertItem(tableName, item, callback);
};

//http://gauravmantri.com/2012/04/30/comparing-windows-azure-table-storage-and-amazon-dynamodb/