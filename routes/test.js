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
    res.render('test/index', {
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
    res.render('test/uploadFile', {
        title: 'Upload file'
    });
});

router.post('/uploadFile', upload.single('uploadFile'), function (req, res, next) {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
    //console.log(req.body); //form fields
    //console.log(req.file); //form files
    //console.log(req.path); //form files

    cloudWrp.createBoxFileFromLocalFile('images-in', req.file.originalname,
        req.file.path,
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




var fileList = ['aaaa', 'bbbbbbb', 'cccccccc'];

router.get('/files', function (req, res, next) {

    var tableSvc = cloudWrp.azure.createTableService();
    /*
    //https://docs.microsoft.com/en-us/azure/storage/storage-nodejs-how-to-use-table-storage
    //http://stackoverflow.com/questions/40468960/easiest-way-to-map-azure-table-storage-data-model-in-node-js
    //http://stackoverflow.com/questions/34334433/transform-response-from-azure-table-storage-with-node
    //https://github.com/Azure-Samples/storage-table-node-getting-started
    //https://docs.microsoft.com/en-us/rest/api/storageservices/fileservices/query-entities
    tableSvc.createTableIfNotExists('multicloud', function (error, result, response) {
        if (!error) {
            // Table exists or created
        }
    });

    var entGen = cloudWrp.azure.TableUtilities.entityGenerator;
    var task = {
        PartitionKey: entGen.String('hometasks'),
        RowKey: entGen.String('1'),
        description: entGen.String('take out the trash'),
        inserted: entGen.DateTime(new Date()),
    };
    var task2 = {
  PartitionKey: {'_':'hometasks'},
  RowKey: {'_': '2'},
  description: {'_':'Wash the dishes'},
  dueDate: {'_':new Date(2015, 6, 20)}
};

    tableSvc.insertEntity('multicloud', task, function (error, result, response) {
        if (!error) {
            // Entity inserted
        }
    });
    
    */

    var options = {
        payloadFormat: "application/json;odata=nometadata"
    };

    var query = new cloudWrp.azure.TableQuery()
        .top(5);

    tableSvc.queryEntities('multicloud', query, null, options, function (error, result, response) {
        if (!error) {
            // query was successful
            //console.log(result);
            //fileList = result;
            //console.log(fileList[0].description);
            //console.log(result.entries['0'].description._);

            // var items = result.entries;
            
            // items.forEach(function (item) {
            //     console.log(item);
            //     console.log("Task: %s, %s, %s, %s", item.PartitionKey._, item.RowKey._, item.description._, '');
            // });

            // var items2 = response.body;            

            res.render('test/files', {
                title: 'Uploaded images',
                items: response.body.value,
            });
        }
    });
});

module.exports = router;