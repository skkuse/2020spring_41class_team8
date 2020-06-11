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

router.get('/index', function(req, res, next) {
  res.render('index', { title: 'index'});
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'login'});
});

router.get('/register', function(req, res, next) {
  res.render('register', { title: 'register'});
});


module.exports = router;
