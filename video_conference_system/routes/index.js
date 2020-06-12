var express = require('express');
var router = express.Router();
let path = require('path');
var fs = require('fs');
const fileUpload = require('express-fileupload');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('main', { title: 'Main' });
});

router.get('/roomName', function (req, res, next) {
  res.render('roomName', { title: 'roomName' });
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
  const pyProg = spawn('python', ["b.py", filepath]);
  pyProg.stdout.on('data', function (data) {
    console.log(data.toString());

    console.log('done..');
    console.log(data.toString());

    downloadpath = "" + data.toString()
    downloadpath = downloadpath.replace(' ', '')
    downloadpath = downloadpath.replace('\r', '')
    downloadpath = downloadpath.replace('\n', '')

    var fileName = downloadpath;
    var filePath = path.join(__dirname, "../", fileName);
    fs.writeFile(filePath, data, function (err) {
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

module.exports = router;
