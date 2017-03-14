var azureService = require('./azure-wrapper');
var awsService = require('./aws-wrapper');

var exports = module.exports;

var _cloudSrv;

exports.azure = azureService.azure;
exports.aws = awsService;

exports.initCloudService = function (cloudServiceName) {
    switch (cloudServiceName) {
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


exports.createBoxFileFromLocalFile = function (container, blob, localFileName, optionsOrCallback, callback) {
    return _cloudSrv.createBoxFileFromLocalFile(container, blob, localFileName, optionsOrCallback, callback);
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