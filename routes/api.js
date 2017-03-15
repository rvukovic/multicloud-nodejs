var express = require('express');
var router = express.Router();

var azure = require('azure-storage');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.json({ message: 'multicloud API' });   
});



module.exports = router;