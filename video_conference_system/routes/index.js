var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('main', { title: 'Main' });
});

router.get('/roomName', function(req, res, next) {
  res.render('roomName', { title: 'roomName' });
});

router.get('/conferenceRoom', function(req, res, next) {
  res.render('conferenceRoom', { title: 'conferenceRoom' });
});

module.exports = router;
