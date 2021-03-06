var express = require('express');
var router = express.Router();
var fs = require('fs');
var multer = require('multer');
var upload = multer({ dest: 'uploads/' });


var cloudWrp = require('../services/cloud-wrapper');
cloudWrp.initCloudService(); 


/* GET home page. */
router.get('/', function (req, res, next) {

    cloudWrp.getItemsList(cloudWrp.TableName, 100, function (error, data) {
        if (!error) {
            console.log(data.timingStr);
            data.map(function(item) {
                item.timing = JSON.parse(item.timingStr);
            })

            console.log(data);
            res.render('index', {
                title: 'Multi cloud PoC - v0.25',
                cloudService: process.env['CLOUD_SERVICE'],
                items: data,
                success: req.flash('success'),
                error: req.flash('error'),
            });
        }
    });
});

function getBeginAndEnd(value, count) {
     var len = value.length;
     return value.substring(0, count) + ' ... ' + value.substring(len-count, len);
}

router.get('/configuration', function (req, res, next) {
    var  azkey= getBeginAndEnd(process.env['AZURE_STORAGE_ACCESS_KEY'], 20);

     var items = [
         {'key': 'Cloud service', 'value' : process.env['CLOUD_SERVICE'] },
         {'key': 'Azure Storage Account', 'value' : process.env['AZURE_STORAGE_ACCOUNT']},
         {'key': 'Azure Key', 'value' : azkey },
         {'key': '-------------------------------', 'value' : '----------------------------------------'},
         {'key': 'Message Queue', 'value' : process.env['MESSAGE_QUEUE_NAME'] },
         {'key': 'S3 / Blob Name In', 'value' : process.env['BOX_STORAGE_NAME_IN'] },
         {'key': 'S3 / Blob Name Out', 'value' : process.env['BOX_STORAGE_NAME_OUT'] },
         {'key': 'Azure Table / DynamoDB table', 'value' : process.env['TABLE_STORAGE_NAME'] },
         {'key': 'Webhook URL', 'value' : process.env['IMAGE_PROCESS_WEBHOOK'] }
     ];

     res.render('configuration', {
        title: 'Configuration',
        items: items
    });
});

function pushMessage(name, description, url, callback) {
    var newMsg = {
        timestamp: + new Date(),
        submitted: new Date(),
        callbackUrl: process.env['IMAGE_PROCESS_WEBHOOK'],
        description: description,
        source: {
            name: name,
            box: cloudWrp.BoxNameIn,
            url: url
        },
        destination: {
            name: name,
            box: cloudWrp.BoxNameOut
        }
    };

    console.log('Preparing to send Message: ' + newMsg);
    cloudWrp.createMessage(cloudWrp.MessageQueueName, newMsg, function (error, result, response) {
        if (!error) {
            console.log('Message created');
            callback();
        } else {
            console.log('ERROR: Queue message:' + JSON.stringify(error));
        }
    });
}

function getExtension(filename) {
    return filename.split('.').pop();
}

router.post('/upload', upload.single('uploadFile'), function (req, res, next) {
    if (!req.file) {
        res.redirect('/');
    }    

    var uploadedFile = req.file.path +'.' + getExtension(req.file.originalname);
    fs.renameSync(req.file.path, uploadedFile);
    cloudWrp.createBoxFileFromLocalFile(cloudWrp.BoxNameIn, req.file.originalname, uploadedFile,
        function (error, data ) {
            fs.unlink(uploadedFile);
            if (!error) {
                var url = data.url;
                console.log('file uploaded: ' + url);
                pushMessage(req.file.originalname, req.body.description, url, function () {
                    console.log('Doing redirect ........');
                    req.flash('success', 'File ' + req.file.originalname + ' uploaded successfully');
                    res.redirect('/');
                });
            } else {
                console.log('ERROR: blob upload: ' + error);
                req.flash('error:','ERROR: ' + error);
                res.send('ERROR: blob upload: ' + error);
            }
        });
});

module.exports = router;