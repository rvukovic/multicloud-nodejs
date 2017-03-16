var express = require('express');
var router = express.Router();
var fs = require('fs');
var multer = require('multer');
var upload = multer({ dest: 'uploads/' });
var jimp = require('jimp');

var cloudWrp = require('../services/cloud-wrapper');
cloudWrp.initCloudService(); // 'azure' or 'aws'

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.render('testAzure/index', {
        title: 'Test page'
    });
});

router.get('/jimp', function (req, res, next) {
    
    res.send('jimp image processing');
    // res.render('testAzure/index', {
    //     title: 'Test page'
    // });
});

// var processImage = function (req) {

//     jimp.read(inImage, function (error, image) {
//         if (error) {
//             console.log(err);
//             throw err;
//         }

//         image.scale(0.5);
//         image.getBuffer(Jimp.AUTO, function (error, imageData) {
//             context.log('Node.JS blob trigger function resized ' + context.bindingData.name + ' to ' + image.bitmap.width + 'x' + image.bitmap.height);
//             context.bindings.outImage = imageData;
//             context.done();
//         });
//     });
// };

/* GET home page. */
router.get('/newMessage', function (req, res, next) {
    res.render('testAzure/newMsg', {
        title: 'Create new Message'
    });
});

router.post('/newMessage', function (req, res, next) {
    var newMsg = {
        //PartitionKey: req.body.name,
        timestamp: + new Date(),
        inserted: new Date(),
        callbackUrl: process.env['IMAGE_PROCESS_WEBHOOK'],
        description: req.body.description,
        source: {
            name: req.body.name,
            boxIn: cloudWrp.BoxNameIn,
            url: 'http://image.url.com' 
        },
        destination: {
            //name: req.body.name,
            box: req.body.description,
            boxOut: cloudWrp.BoxNameOut,
        }
    };

    cloudWrp.createMessage(cloudWrp.MessageQueueName, newMsg, function (error, result, response) {
        if (!error) {
            console.log('Message created');
            res.send('Message created' + JSON.stringify(newMsg));
        } else {
            console.log('ERROR: Queue message:' + JSON.stringify(error));
            res.send('ERROR: Queue message:' + JSON.stringify(error));
        }
    });
});

router.get('/uploadFile', function (req, res, next) {
    res.render('testAzure/uploadFile', {
        title: 'Upload file'
    });
});

router.post('/uploadFile', upload.single('uploadFile'), function (req, res, next) {
    cloudWrp.createBoxFileFromLocalFile(cloudWrp.BoxNameIn, req.file.originalname, req.file.path,
        function (error, result, response) {
            fs.unlink(req.file.path);
            if (!error) {
                var url = cloudWrp.getBoxFileUrl(cloudWrp.BoxNameIn, req.file.originalname);
                console.log('file uploaded: ' + url);
                res.send('File uploaded: ' + url);
            } else {
                console.log('ERROR: blob upload: ' + error);
                res.send('ERROR: blob upload: ' + error);
            }
        });  
});

router.get('/newFile', function (req, res, next) {
    res.render('testAzure/newFile', {
        title: 'Create a new Table record',
    });
});

router.post('/newFile', function (req, res, next) {
    var newRecord = {
        PartitionKey: req.body.key,
        RowKey: req.body.rowId,
        description: req.body.description,
        description2: req.body.tag,
        inserted: new Date()
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


router.get('/files', function (req, res, next) {

    cloudWrp.getItemsList(cloudWrp.TableName, 100, function (error, result, response) {
        if (!error) {
            console.log(response.body.value);
            res.render('testAzure/files', {
                title: 'Uploaded images',
                // Azure specific
                items: response.body.value,
            });
        }
    });
});

module.exports = router;