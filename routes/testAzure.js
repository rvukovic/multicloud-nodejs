var express = require('express');
var router = express.Router();
var fs = require('fs');
var multer = require('multer');
var upload = multer({
    dest: 'uploads/'
});

var cloudWrp = require('../services/cloud-wrapper');
cloudWrp.initCloudService(process.env['CLOUD_SERVICE']); // 'azure' or 'aws'

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.render('testAzure/index', {
        title: 'Test page'
    });
});

/* GET home page. */
router.get('/newMessage', function (req, res, next) {
    var now = new Date().toISOString();
    var msgContent = 'Message ' + now;

    cloudWrp.createMessage('a9-queue-items', msgContent, function (error, result, response) {
        if (!error) {
            console.log('Message created');
        } else {
            console.log('ERROR: Queue message:' + error);
        }
    });

    //res.render('index', { title: 'Express' });
    res.send('New message created: ' + msgContent);
});

router.get('/uploadFile', function (req, res, next) {
    res.render('testAzure/uploadFile', {
        title: 'Upload file'
    });
});

router.post('/uploadFile', upload.single('uploadFile'), function (req, res, next) {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
    //console.log(req.body); //form fields
    //console.log(req.file); //form files
    //console.log(req.path); //form files

    cloudWrp.createBoxFileFromLocalFile('images-in', req.file.originalname, req.file.path,
        function (error, result, response) {

            fs.unlink(req.file.path);
            if (!error) {
                console.log('file uploaded');
                res.send('File uploaded');
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

    cloudWrp.insertItem('multicloud', newRecord, function (error, result, response) {
        if (!error) {
            console.log('record inserted: ' + newRecord);
        } else {
            console.log('ERROR: ' + error);
        }
    });

    res.send('received: ' + JSON.stringify(req.body));
});


router.get('/files', function (req, res, next) {

    cloudWrp.getItemsList('multicloud', 100, function (error, result, response) {
        if (!error) {
            res.render('testAzure/files', {
                title: 'Uploaded images',
                // Azure specific
                items: response.body.value,
            });
        }
    });
});

module.exports = router;