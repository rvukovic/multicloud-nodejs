var express = require('express');
var router = express.Router();
var fs = require('fs');
var multer = require('multer');
var upload = multer({ dest: 'uploads/' });


var cloudWrp = require('../services/cloud-wrapper');
cloudWrp.initCloudService(); // 'azure' or 'aws'


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {
        title: 'Multi cloud PoC - v0.14',
        cloudService: process.env['CLOUD_SERVICE']
    });
});

router.get('/upload', function (req, res, next) {
    res.render('upload', {
        title: 'Upload image'
    });
});

var pushMessage = function (name, description, url) {
    var newMsg = {
        timestamp: + new Date(),
        inserted: new Date(),
        callbackUrl: process.env['IMAGE_PROCESS_WEBHOOK'],
        description: description,
        source: {
            name: name,
            box: cloudWrp.boxIn,
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
        } else {
            console.log('ERROR: Queue message:' + JSON.stringify(error));
        }
    });
};

router.post('/upload', upload.single('uploadFile'), function (req, res, next) {
    cloudWrp.createBoxFileFromLocalFile(cloudWrp.BoxNameIn, req.file.originalname, req.file.path,
        function (error, result, response) {
            fs.unlink(req.file.path);
            if (!error) {
                var url = cloudWrp.getBoxFileUrl(cloudWrp.BoxNameIn, req.file.originalname);
                pushMessage(req.file.originalname, req.body.name, url);
                console.log('file uploaded: ' + url);
                res.send('File uploaded: ' + url);
            } else {
                console.log('ERROR: blob upload: ' + error);
                res.send('ERROR: blob upload: ' + error);
            }
        });  
});


module.exports = router;