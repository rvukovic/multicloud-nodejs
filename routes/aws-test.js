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

router.get('/index', function (req, res, next) {
    cloudWrp.getItemsList(cloudWrp.TableName, 1, function(error, data){
        res.render('aws-test/index', {
            title: '',
            items: data
        });
    }); 
});

router.post('/index', upload.single('uploadFile'), function (req, res, next) {

    var filePath = req.file.path;
    var imageTitle = req.body.name;

    //Image keys (unique name + timestamp)
    var imageNewName = generateUniqueFileName(req.file.originalname);
    var uploadTimestamp = (new Date()).getTime();


    //1. Save in S3
    cloudWrp.createBoxFileFromLocalFile(
        cloudWrp.BoxNameIn, imageNewName, filePath,
        function (error, data, response) {
            fs.unlink(filePath);
            if (error) {
                console.log('Error uploading to S3: ' + error);
                res.send('Error uploading to S3: ' + error);
            }
        }
    );

    //2. Insert save in dynamo
    cloudWrp.insertItem( 
        cloudWrp.TableName, imageNewName, uploadTimestamp, req.body.name, function(error, data, response) {
            if(error) {
                console.log('Error saving item', error);
                res.send('Error saving item', error)
            }
            console.log('Uploaded file save into Dynamo')
        }
    );

    //3. Send message for processing image
    var newMessage = {
        timestamp: + new Date(),
        callbackUrl: process.env['IMAGE_PROCESS_WEBHOOK'],
        name: imageNewName,
        uploadTimestamp: uploadTimestamp, 
        source: {
            boxIn: cloudWrp.BoxNameIn,
            url: 'http://image.url.com' 
        },
        destination: {
            boxOut: cloudWrp.BoxNameOut
        }
    };

    cloudWrp.createMessage(cloudWrp.MessageQueueName,JSON.stringify(newMessage),function(error, data){
        if(error) {
            console.log('error sending message', error);
            res.send('Error saving in db', error);
        }
        console.log('Message sent...');
    });


    //4. Get the list of uploaded files
    cloudWrp.getItemsList(cloudWrp.TableName, 0, function(error, data){
        res.render('aws-test/index', {
            title: 'Upload file successful!',
            items: data
        });
    }); 

});

/**
 * Prepends random string in front of original file name.
 * @param {*originalName} the original file name 
 */
function generateUniqueFileName(originalName) {
    return randomstring.generate() + '_' + originalName;
}

module.exports = router;