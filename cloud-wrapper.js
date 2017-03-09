
var azureService = require('./azure-wrapper');
var awsService = require('./aws-wrapper');

var exports = module.exports;

var _cloudSrv;

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
}