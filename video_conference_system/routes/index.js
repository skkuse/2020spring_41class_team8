var express = require('express');
var router = express.Router();

let path = require('path');
var fs = require('fs');
const fileUpload = require('express-fileupload');

const User = require("../models/user");
const mongoose = require("mongoose");

/* GET home page. */
router.get('/main', function(req, res, next) {
  res.render('main', { title: 'Main' });
});

router.get('/roomName', function (req, res, next) {
  res.render('roomName', { title: 'roomName' });
});

router.get('/', function(req, res, next) {
  res.render('index', { title: 'index'});
});
  
router.post('/upload', function (req, res, next) {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }
  let media = req.files;
  let filepath = "files/" + req.files['imageupload']['name'];
  for (let pos in media) {
    media[pos].mv(filepath, (err) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err
        });
      }
    });
  }
  res.set('Content-Type', 'text/html');
  const { spawn } = require('child_process');
  const pyProg = spawn('python3', ["audio2text.py", filepath, "English"]);
  pyProg.stdout.on('data', function (data) {
    console.log(data.toString());
    console.log('done..');
    console.log(data.toString());
	  console.log('debug')
    downloadpath = data.toString()
    // downloadpath = downloadpath.replace(' ', '')
    downloadpath = downloadpath.replace('\r', '')
    downloadpath = downloadpath.replace('\n', '')

    var fileName = downloadpath;
	console.log(fileName);
    var filePath = path.join(__dirname, "../", fileName);
	var text = fs.readFileSync(filePath, 'utf8');
    fs.writeFile(filePath, text, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log('Done');
        res.download(filePath, fileName, function (err) {
          console.log('download callback called');
          if (err) {
            console.log('something went wrong');
          }
        });
      }
    });
  });
});

router.post('/uploadkorean', function (req, res, next) {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }
  let media = req.files;
  let filepath = "files/" + req.files['imageupload']['name'];
  for (let pos in media) {
    media[pos].mv(filepath, (err) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err
        });
      }
    });
  }
  res.set('Content-Type', 'text/html');
  const { spawn } = require('child_process');
  const pyProg = spawn('python3', ["audio2text.py", filepath, "Korean"]);
  pyProg.stdout.on('data', function (data) {
    console.log(data.toString());

    console.log('done..');
    console.log(data.toString());

	console.log('debug')
    downloadpath = data.toString()
    // downloadpath = downloadpath.replace(' ', '')
    downloadpath = downloadpath.replace('\r', '')
    downloadpath = downloadpath.replace('\n', '')

    var fileName = downloadpath;
	console.log(fileName);
    var filePath = path.join(__dirname, "../", fileName);
	var text = fs.readFileSync(filePath, 'utf8');
    fs.writeFile(filePath, text, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log('Done');
        res.download(filePath, fileName, function (err) {
          console.log('download callback called');
          if (err) {
            console.log('something went wrong');
          }
        });
      }
    });
  });
});
router.get('/conferenceRoom', function (req, res, next) {
  res.render('conferenceRoom', { title: 'conferenceRoom' });
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
            else{
                res.send('<script type="text/javascript">alert("Please check your email or password."); window.location="/login"; </script>');
            }
        });
});


module.exports = router;
