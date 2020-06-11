
var RateLimit = require('express-rate-limit');//express-rate-limit is used to prevent brute force attacks on the server
var mysqlpool = require('./mysql').pool; // get the pool configuration to make queries to the mysql database
var moment = require('moment'); // moment is used for processing  all javascript and mysql dates


// app/routes.js
module.exports = function(app, passport,parameters) {


    //the rate limit achieves the foollowing objective:
    //a) 13 failed login attempts regardless of username in the span of 10 minutes
    //the limiter object created is placed in the app login route before your passport login authentication
    const limiter = new RateLimit({
      windowMs: parameters.windowMs,// 10*60*1000 //10*1000, // 10 minutes to keep record in memory.
      max: parameters.max, //2// limit each IP to 13 requests per windowMs, max number of connections during windowMs milliseconds before sending a 429 response
      delayMs: 0, // disable delaying - full speed until the max limit is reached
      message: 'Too many requests, please try again later.',//Error message returned when max is exceeded.
      onLimitReached: function(req, res, options){
        //a function called everytime the request limit is reached.
        //when the limit is reached this function stores the ip address of the user who crossed the limit along with the time the limit was reached.
        console.log("Limit Reached called");
        const myLockTime =  moment(new Date()).format("YYYY-MM-DD HH:mm:ss");// convert new javascript date to format to process using moment library
        const ipaddress = req.ip;//get the ipaddress of the user making to request.

          mysqlpool.getConnection(function(err, connection){//create a sql connection
            //check if the ipaddress currently exists in the table if it does update the column, lastLockedTime.
            //if the ipaddress does not exist, create a new row with the ipaddress and timestamp.
            connection.query("select * from ipslocked where ipaddress = ?",[ipaddress],function(err,rows){
              if (err)
              {
                connection.release();
                return done(err);
              }
              if (rows.length>0) {
                //check is the ipaddress already exists. it exists if the count is greater than 0.
                if(rows[0].lastLockedTime!==null)
                {
                  //checks if the ipaddress already has a lastLockedTime. If it does have a lastLockedTime that means the ipaddress is already in the 20 minutes waiting period
                  //so we only want to update the ipaddress with a new timestamp when the lastLockedTime is reset back to null. This occurs when the user logs back in after 20 minutes
                  connection.release();
                  return;
                }
                //here is where the ipaddress is updated with a new lastLockedTime timestamp
                connection.query("update ipslocked set lastLockedTime= ? where ipaddress = ?",[myLockTime, ipaddress],function(err,result){
                  if(err){
                    console.log("Error updating locked time:"+err);
                    connection.release();
                    return err;
                  }
                  else{
                    connection.release();
                    return;
                  }
                });
              }
              else {
                const insertQuery = "insert into ipslocked ( ipaddress, lastLockedTime) values (?,?)";
                connection.query(insertQuery,[ipaddress, myLockTime],function(err,result){
                  if (err)
                  {
                    console.log("Error inserting new locked user:"+err);
                    connection.release();
                    return err;
                  }
                  else{
                    connection.release();
                    return;
                  }

              });
            }

          });

        });
      }
    });

    // =====================================
    // LOGIN ===============================
    // =====================================

    app.get('/login', isNotLoggedIn, function(req, res) {
        // render the page and pass in any flash data if it exists

        var options = {};
        options.message = req.flash('loginMessage');

        res.render('ejs/login', options);
    });

    app.post('/login', limiter, passport.authenticate('local-login', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));


    app.get('/register', isNotLoggedIn, function(req, res) {
        // render the page and pass in any flash data if it exists
        var options = {};
        options.message = req.flash('registerMessage');

        res.render('ejs/register', options);
    });

    // process the signup form
    app.post('/register', passport.authenticate('local-signup', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/register', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));


    app.get('/logout', isLoggedIn, function(req, res) {

        req.logout();
        res.redirect('/login');
    });


    app.get("/profile", isLoggedIn,
        function(req, res) {
            var options = {};
            options.user = req.user;
            //pass in user data to profile page
            res.render('ejs/profile', options);
        });



//default route that go home page if the other routes above dont match
    app.get("/*", function(req, res) {
        res.render('ejs/index');
    });

    // route middleware to make sure
    function isLoggedIn(req, res, next) {

        // if user is authenticated in the session, carry on
        if (req.isAuthenticated())
            return next();
        // if they aren't redirect them to the home page
        res.redirect('/');
    }

    // route middleware to make sure
    function isNotLoggedIn(req, res, next) {

        // if user is not authenticated in the session, carry on
        if (!req.isAuthenticated())
            return next();
        // if they are redirect them to the profile page
        res.redirect('/profile');
    }
}
