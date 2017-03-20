var express = require('express');
var router = express.Router();
var jimp = require('jimp');
var fs = require('fs');
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

    var origName = req.body.source.name;

    var newRecord = {
        PartitionKey: '' + req.body.timestamp,
        RowKey: origName,
        callbackUrl: req.body.callbackUrl,
        description: req.body.description,
        original_name: origName,
        original_url: req.body.source.url,
        original_box: req.body.source.box,
        transformed_name: req.body.destination.name,
        transformed_url: '',
        transformed_box: req.body.destination.box,
        submitted: req.body.submitted,
        funcBounce: req.body.funcBounce,
        accepted: new Date(),
        processed: req.body.submitted, // will be overwritten below
        uploaded:  req.body.submitted // will be overwritten below
    };

    //var tmpName = 'uploads/' + fs.mkdtempSync('multicloud');
    var tmpName = 'uploads/' + req.body.timestamp + '-' + origName;
    console.log('Using temp file: ' + tmpName);
    jimp.read(req.body.source.url).then(function (image) {
        image.resize(jimp.AUTO, 240)            // resize
            .quality(60)                 // set JPEG quality
            .greyscale();                 // set greyscale
        //jimp.loadFont(jimp.FONT_SANS_64_WHITE).then(function (font) {
        // creating new FONTS http://kvazars.com/littera/
        jimp.loadFont(Path.join(__dirname, '../fonts/arch9/arch9.fnt')).then(function (font) {
            image.print(font, 140, 90, 'Arch9')
                .write(tmpName, function () {
                    // save
                    newRecord.processed = new Date();
                    cloudWrp.createBoxFileFromLocalFile(cloudWrp.BoxNameOut, origName, tmpName,
                        function (error, result, response) {
                            fs.unlink(tmpName);
                            if (!error) {
                                newRecord.transformed_url = cloudWrp.getBoxFileUrl(cloudWrp.BoxNameOut, origName);
                                console.log('file uploaded: ' + newRecord.transformed_url);
                                console.log('Preparing to insert record: ' + JSON.stringify(newRecord));
                                newRecord.uploaded = new Date();
                                cloudWrp.insertItem(cloudWrp.TableName, newRecord, function (error, result, response) {
                                    if (!error) {
                                        console.log('record inserted: ' + JSON.stringify(newRecord));
                                        res.json({
                                            timestamp: new Date(),
                                            message: 'record inserted',
                                            data: newRecord
                                        });

                                    } else {
                                        console.log('ERROR: ' + error);
                                        var err = {
                                            error: error,
                                            result: result,
                                            response: response
                                        };
                                        res.json({
                                            timestamp: new Date(),
                                            message: 'Error inserting record in the table',
                                            data: err
                                        });
                                    }
                                });
                            } else {
                                console.log('ERROR: blob upload: ' + error);
                                res.send('ERROR: blob upload: ' + error);
                            }
                        });

                });
        });
    }).catch(function (err) {
        console.log(err);
    });
});

module.exports = router;