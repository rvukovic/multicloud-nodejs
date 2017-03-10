var express = require('express');
var router = express.Router();

var azure = require('azure-storage');

var cloudWrp = require('../cloud-wrapper');

/* GET home page. */
router.get('/', function(req, res, next) {
  
 //----------------------------------------------------
  cloudWrp.initCloudService('azure');
  
  var now = new Date().toISOString();

  cloudWrp.createBoxFileFromLocalFile('images-in', '.gitignore-'+ now,
        '/Users/robert/Work/Tests/Azure/Arch9/multicloud-nodejs/.gitignore',
        function (error, result, response) {
            if (!error) {
                console.log('file uploaded');
            } else {
                console.log('ERROR: blob upload: ' + error);
            }
        });
    
    cloudWrp.createMessage('a9-queue-items', 'Message ' + now, function (error, result, response) {
        if (!error) {
            console.log('Message created');
        } else {
            console.log('ERROR: Queue message:' + error);
        }
    });
    //----------------------------------------------------


  res.render('index', { title: 'Express' });
});

module.exports = router;
