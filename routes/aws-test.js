var express = require('express');
var router = express.Router();
var fs = require('fs');
var multer = require('multer');
var randomstring = require("randomstring");

var upload = multer({
    dest: 'uploads/'
});

var cloudWrp = require('../services/cloud-wrapper');
cloudWrp.initCloudService(process.env['CLOUD_SERVICE']); // 'azure' or 'aws'

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.render('aws-test/index', {
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
    cloudWrp.getItemsList(cloudWrp.TableName, 1, function(error, data){
        res.render('aws-test/uploadFile', {
            title: '',
            items: data
        });
    }); 
});

router.post('/uploadFile', upload.single('uploadFile'), function (req, res, next) {
    cloudWrp.createBoxFileFromLocalFile(
        'levi9-multicloud-images-in', req.file.originalname, req.file.path,
        function (error, data, response) {
            fs.unlink(req.file.path);
            if (error) {
                console.log('ERROR: blob upload: ' + error);
                res.send('ERROR: blob upload: ' + error);
            }
            cloudWrp.insertItem( 
                cloudWrp.TableName, req.file.originalname, (new Date()).getTime(), req.body.name, function(error, data, response) {
                    if(error) {
                        console.log('error saving item', error);
                        res.send('Error saving in db', error)
                    }
                }
            );
            cloudWrp.createMessage('','',function(error, data){
                if(error) {
                    console.log('error sending message', error);
                    res.send('Error saving in db', error);
                }
                console.log('Message sent...');
            });

        }
    );

    cloudWrp.getItemsList(cloudWrp.TableName, 1, function(error, data){
        res.render('aws-test/uploadFile', {
            title: 'Upload file successful!',
            items: data
        });
    }); 

});

module.exports = router;