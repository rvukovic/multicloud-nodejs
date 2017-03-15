var express = require('express');
var router = express.Router();

var azure = require('azure-storage');

/* GET home page. */
router.get('/', function (req, res, next) {

    res.render('index', {
        title: 'Multi cloud PoC - v0.12',
        cloudService: process.env['CLOUD_SERVICE']
    });
});

module.exports = router;