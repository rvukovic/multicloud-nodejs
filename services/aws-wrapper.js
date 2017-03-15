var aws = require('aws-sdk');

var exports = module.exports;

exports.createBoxFileFromLocalFile = function (container, fileName, localFileName, callback) {

    var s3 = new aws.S3();
    var params = {Bucket: container, Key: fileName, Body: require('fs').createReadStream(localFileName)};
    s3.upload(params, callback);

};

exports.createMessage = function (queue, messageText, callback) {
    
};

exports.getItemsList = function (tableName, itemLimit, callback) {
    
};