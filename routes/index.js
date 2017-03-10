var express = require('express');
var router = express.Router();

var azure = require('azure-storage');

var cloudWrp = require('../cloud-wrapper');

/* GET home page. */
router.get('/', function(req, res, next) {
  

  res.render('index', { title: 'Multi cloud PoC - v0.01' });
});

module.exports = router;
