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

    console.log('RECEIVED: ' + req.body);    
    var newRecord = {
        PartitionKey: req.body.source.name,
        RowKey: req.body.timestamp,
        callbackUrl: req.body.callbackUrl,
        description: req.body.description,
        original_name: req.body.source.name,
        original_url: req.body.source.url,
        original_box: req.body.source.box,
        transformed_name: req.body.destination.name,
        transformed_url: req.body.destination.url,
        transformed_box: req.body.destination.box,
        inserted: req.body.inserted
    };

    cloudWrp.insertItem(cloudWrp.TableName, newRecord, function (error, result, response) {
        if (!error) {
            console.log('record inserted: ' + newRecord);
            res.send('received: ' + JSON.stringify(req.body));
        } else {
            console.log('ERROR: ' + error);
            var err = {
                error: error,
                result: result,
                response: response
            };
            res.send('ERROR: ' + JSON.stringify(err));
        }
    });
});

module.exports = router;