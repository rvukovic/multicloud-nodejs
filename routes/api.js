var express = require('express');
var router = express.Router();

var cloudWrp = require('../services/cloud-wrapper');
cloudWrp.initCloudService();


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
    var newRecord = {
        PartitionKey: req.body.source.name,
        RowKey: '' + req.body.timestamp,
        callbackUrl: req.body.callbackUrl,
        description: req.body.description,
        original_name: req.body.source.name,
        original_url: req.body.source.url,
        original_box: req.body.source.box,
        transformed_name: req.body.destination.name,
        transformed_url: '',
        transformed_box: req.body.destination.box,
        submitted: req.body.inserted
    };

    console.log('Preparing to insert record: ' + JSON.stringify(newRecord));
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

});

module.exports = router;