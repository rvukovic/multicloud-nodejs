var express = require('express');
var router = express.Router();

var azure = require('azure-storage');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.json({ message: 'multicloud API' });   
});

router.post('/processImage', function (req, res, next) {

    res.json({ timestamp: new Date(),data: req.body });   
});

module.exports = router;