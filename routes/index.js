var express = require('express');
var router = express.Router();
var fs = require('fs');
var multer = require('multer');
var upload = multer({ dest: 'uploads/' });


var cloudWrp = require('../services/cloud-wrapper');
cloudWrp.initCloudService(); // 'azure' or 'aws'


/* GET home page. */
router.get('/', function (req, res, next) {

    cloudWrp.getItemsList(cloudWrp.TableName, 100, function (error, result, response) {
        if (!error) {
            console.log(response.body.value);

            res.render('index', {
                title: 'Multi cloud PoC - v0.16',
                cloudService: process.env['CLOUD_SERVICE'],
                // Azure specific
                items: response.body.value,
            });
        }
    });
});

router.get('/redirect', function (req, res, next) {
    res.redirect(307, '/');
});


router.get('/upload', function (req, res, next) {
    res.render('upload', {
        title: 'Upload image'
    });
});

var pushMessage = function (name, description, url, callback) {
    var newMsg = {
        timestamp: + new Date(),
        inserted: new Date(),
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
};

function getExtension(filename) {
    return filename.split('.').pop();
}

router.post('/upload', upload.single('uploadFile'), function (req, res, next) {

    var uploadedFile = req.file.path +'.' + getExtension(req.file.originalname);
    fs.renameSync(req.file.path, uploadedFile);
    cloudWrp.createBoxFileFromLocalFile(cloudWrp.BoxNameIn, req.file.originalname, uploadedFile,
        function (error, result, response) {
            //fs.unlink(uploadedFile);
            if (!error) {
                var url = cloudWrp.getBoxFileUrl(cloudWrp.BoxNameIn, req.file.originalname);
                console.log('file uploaded: ' + url);
                pushMessage(req.file.originalname, req.body.description, url, function () {
                    console.log('Doing redirect ........');
                    res.redirect('/');
                    //res.send('done');
                });
            } else {
                console.log('ERROR: blob upload: ' + error);
                res.send('ERROR: blob upload: ' + error);
            }
        });
});


module.exports = router;