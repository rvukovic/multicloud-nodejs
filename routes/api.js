var express = require('express');
var router = express.Router();
var jimp = require('jimp');
var fs = require('fs');
var waterfall = require('async-waterfall');
var cloudWrp = require('../services/cloud-wrapper');
cloudWrp.initCloudService();
var Path = require('path');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.json({ message: 'multicloud API' });
});

router.post('/test', function (req, res, next) {
    res.json({
        timestamp: new Date(),
        data: req.body
    });
});

router.post('/processImage', function (req, res, next) {

    console.log('Request: ' + JSON.stringify(req.body));

    waterfall([
        (callback) => { transformImage(req.body, callback) },
        uploadToObjectStore,
        saveToDocumentDb
    ], 
        (error, data, response) => {
        if (error) {
            console.log('ERROR: ' + error); 
            res.json({
                timestamp: new Date(),
                message: 'Error inserting record in the table',
                data: {
                    error: error, result: result, response: response
                }
            });
        } 
        
        res.json({timestamp: new Date(), message: 'record inserted', data: data});
    });
    
});

function transformImage(requestJson, callback) {
    var imagePath = 'uploads/' + requestJson.timestamp + '-' + requestJson.source.name;
    console.log('Using temp file: ' + imagePath);
    jimp.loadFont(Path.join(__dirname, '../fonts/arch9/arch9.fnt')).then((font) => {
        //console.log('Read image', req.body.source.url, ' Callback image ', image);
        jimp.read(requestJson.source.url).then((image) => {
            image.resize(jimp.AUTO, 240).quality(60).greyscale((error, image) => {
                image.print(font, 140, 90, 'Arch9').write(imagePath, (error, data) => {
                    callback(null, requestJson, imagePath)
                });
            });
        });
    }).catch((error) => {
        fs.unlink(imagePath);
        console.error(error);
        callback(error);
    });
}

function uploadToObjectStore(requestJson, imagePath, callback) {
    cloudWrp.createBoxFileFromLocalFile(cloudWrp.BoxNameOut, requestJson.source.name, imagePath, (error, data)=>{
        console.log('File uploaded: ' + imagePath);
        fs.unlink(imagePath);
        callback(error, requestJson, data.url);
    });
}

function saveToDocumentDb(requestJson, url, callback) {
    var newRecord = {
        PartitionKey: requestJson.timestamp.toString(), 
        RowKey: requestJson.source.name,
        callbackUrl: requestJson.callbackUrl,
        description: requestJson.description,
        original_name: requestJson.source.name,
        original_url: requestJson.source.url,
        original_box: requestJson.source.box,
        transformed_name: requestJson.destination.name,
        transformed_url: url,
        transformed_box: requestJson.destination.box,
        submitted: requestJson.submitted,
        funcBounce: requestJson.funcBounce
    };

    console.log('Preparing to insert record: ' + JSON.stringify(newRecord));
    cloudWrp.insertItem(cloudWrp.TableName, newRecord, (error, data) => {
        console.log('Record inserted: ' + JSON.stringify(newRecord));
        callback(error, newRecord);
    });
}

module.exports = router;