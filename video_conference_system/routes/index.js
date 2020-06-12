var express = require('express');
var router = express.Router();
const User = require("../models/user");
const mongoose = require("mongoose");

/* GET home page. */
router.get('/main', function(req, res, next) {
  res.render('main', { title: 'Main' });
});

router.get('/roomName', function(req, res, next) {
  res.render('roomName', { title: 'roomName' });
});

router.get('/conferenceRoom', function(req, res, next) {
  res.render('conferenceRoom', { title: 'conferenceRoom' });
});

router.get('/', function(req, res, next) {
  res.render('index', { title: 'index'});
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'login'});
});

router.get('/register', function(req, res, next) {
  res.render('register', { title: 'register'});
});

router.post("/register", (req, res, next) => {
    console.log(req.body);
    User.find({ username:req.body.username })
        .exec()
        .then(user => {
            if (user.length >= 1) {
                res.send('<script type="text/javascript">alert("Username already exists."); window.location="/register"; </script>');
            } else {
                const user = new User({
                    _id: new mongoose.Types.ObjectId(),
                    username: req.body.username,
                    password: req.body.password
                });
                user
                    .save()
                    .then(result => {
                        console.log(result);
                        res.redirect("/login");
                    })
                    .catch(err => {
                        console.log(err);
                    });
                  }
        });
});

router.post("/login", (req, res, next) => {
    console.log(req.body);
    User.find({ username:req.body.username })
        .exec()
        .then(user => {
            if (user.length >= 1) {
                if (user[0]["password"] == req.body.password){
                    res.redirect("/main");
                }
                else{
                    res.send('<script type="text/javascript">alert("Please check your email or password."); window.location="/login"; </script>');
                }
            }
        });
});


module.exports = router;
