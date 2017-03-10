var express = require('express');
var router = express.Router();

var cloudWrp = require('../cloud-wrapper');
cloudWrp.initCloudService('azure');
 
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('test/index', { title: 'Test page' });
});

/* GET home page. */
router.get('/newMessage', function(req, res, next) {
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

router.get('/uploadFile', function(req, res, next) {

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
    
  res.render('test/uploadFile', { title: 'Upload file' });
});


module.exports = router;
