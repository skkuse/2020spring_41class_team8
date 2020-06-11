
// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;//used to create your custom username password signup signin system.
var bcrypt = require('bcrypt-nodejs');//used to encrypt your passwords
var mysqlpool = require('./mysql').pool; // used to connect to your mysql database
var moment = require('moment'); // used for processing dates  for javascript and mysql.




// expose this function to app using module.exports
module.exports = function(passport, parameters) {


  const minutesLocked = parameters.minutesLocked; // this is the amount of time to disable an ipaddress of a user performing a brute force attack

  	// =========================================================================
      // passport session setup ==================================================
      // =========================================================================
      // required for persistent login sessions
      // passport needs ability to serialize and unserialize users out of session

      // used to serialize the user for the session
      passport.serializeUser(function(user,done) {
  		done(null, user.id);
      });

      // used to deserialize the user
      passport.deserializeUser(function(id,done) {
        mysqlpool.getConnection(function(err, connection){
          connection.query("select * from users where id = ?",[id],function(err,rows){
            if(err){
              connection.release();
              done(null,false);
            }
            else{
              connection.release();
        			done(err, rows[0]);
            }
          });

        });

    });


 	// =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
	// by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
      usernameField : 'username',
      passwordField : 'password',
      passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {
        process.nextTick(function(){
          const data = req.body;//JSON.parse(JSON.stringify(req.body));

  		      //we are checking if the passwords entered by user match, if not throw error in flash to user
          if(data.confirm!=data.password)
          {
            console.log("Passwords are not matching");
            return done(null, false, req.flash('registerMessage', 'Passwords are not matching.'));
          }

          mysqlpool.getConnection(function(err, connection){
            // find a user whose username is the same as the username entered in the form
            connection.query("select * from users where username = ?",[data.username],function(err,rows){

              if (err)
              {
                connection.release();
                return done(err);
              }
                // we are checking to see if the user trying to signup already exists, if the user already exists throw a flash error
      			  if (rows.length>0) {
                console.log("That username is already taken");
                connection.release();
                return done(null, false, req.flash('registerMessage', 'That username is already taken.'));
              }
              else {

                //encrypt hte new user password using bcrypt and a salt
                // Create a password salt
                const salt = bcrypt.genSaltSync(10);

                const newUserMysql = new Object();
                newUserMysql.username = data.username;
                newUserMysql.password = bcrypt.hashSync(data.password, salt);  // use the generateHash function in our user model
                newUserMysql.salt = salt;


                //we insert the new registered user into hte database of users
        				const insertQuery = "insert into users ( username, password,salt) values (?,?,?)";
        				connection.query(insertQuery,[newUserMysql.username, newUserMysql.password, newUserMysql.salt],function(err,result){
                  if (err)
                  {
                    connection.release();
                    return done(err);
                  }

                  console.log(rows)
                  //we retrieved the row id of the new registered user to be serialized by passport.
                  newUserMysql.id = result.insertId;
                  //console.log(rows.insertId)
                  console.log(newUserMysql);
                  connection.release();
          				return done(null, newUserMysql);
                  //return done(null, false, req.flash('signupMessage', 'The account is registered.'));
                  //});
        			    });


              }

            });

          });

		    });
      }));

    function calculateMinutes(startDate,endDate)
    {
      //this function calculates the difference in dates and return the results in minutes
       var start_date = moment(startDate, 'YYYY-MM-DD HH:mm:ss');
       var end_date = moment(endDate, 'YYYY-MM-DD HH:mm:ss');
       var duration = moment.duration(end_date.diff(start_date));
       var minutes = duration.asMinutes();
       return minutes;
    }

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
          // by default, local strategy uses username and password
          usernameField : 'username',
          passwordField : 'password',
          passReqToCallback : true // allows us to pass back the entire request to the callback
      },
      function(req, username, password, done) { // callback with username and password from our form
        process.nextTick(function(){
          const input = req.body;//JSON.parse(JSON.stringify(req.body));

          const data = {
              password : input.password,
              username : input.username
          };
          //ipaddress of the user logging in
          const ipaddress = req.ip;

          mysqlpool.getConnection(function(err, connection){
            //checks if the user signing in has an ipaddress stored in our table for ipaddresses that have be locked previously
            //The following code satifies the objective: 2.Brute force attack prevention. Bruteforce attacks results in a locked request signature for 20 minutes
            connection.query("select * from ipslocked where ipaddress = ?",[ipaddress],function(iperr,ipdata){
              if (iperr)
              {
                connection.release();
                return done(iperr);
              }

              if(ipdata.length>0)
              {
                //if the ipaddress exists then we check if the ipaddress has an datetime in the lastLockedTime passwordField
                //if a datetime exists then the user has an account that should be locked for 20 minutes.
                //we then check the datetime has past 20 minutes or 1 minutte if in testmode, if it has then unlock the ipaddress by setting the lastLockedTime to null.
                if(ipdata[0].lastLockedTime!=null)
                {
                  const lockedTime = moment(ipdata[0].lastLockedTime).format("YYYY-MM-DD HH:mm:ss");//formatting the lastLockedTime stored in database
                  const myCurrentTime =  moment(new Date()).format("YYYY-MM-DD HH:mm:ss");//formatting the current date time.
                  console.log("LockedTIME:"+lockedTime);
                  console.log("myCurrentTime:"+myCurrentTime);
                  const lockMinutes = calculateMinutes(lockedTime,myCurrentTime);// get the difference in minutes of the two dates
                  console.log("Locked Minutes:"+lockMinutes);
                  if(lockMinutes>minutesLocked)
                  {
                    //if the minutes difference is greater than 20 then reset the datetime of that ipaddress.
                    connection.query("update ipslocked set lastLockedTime = ? where ipaddress = ?",[null,ipaddress],function(newerr,result){
                      if (newerr)
                      {
                        console.log("Error resetting last locked date.")
                        connection.release();
                        return done(null, false, req.flash('loginMessage', 'Oops! Error resetting your last locked time.')); // create the loginMessage and save it to session as flashdata
                      }

                    });
                  }
                  else {
                    //if the minutes difference is less than 20 minutes or 1 minute if in testmode then throw a flash message to the user stating the account is suspended for 20 minutes
                    connection.release();
                    const minuteslabel = minutesLocked==1 ? " minute" : " minutes";
                    console.log("Your ipaddress is suspended for "+minutesLocked+ minuteslabel);
                    return done(null, false, req.flash('loginMessage', 'Your ipaddress is suspended for '+minutesLocked+ minuteslabel)); // req.flash is the way to set flashdata using connect-flash
                  }
                }
              }

              //if the users ipaddress is not locked for 20 minutes then continue here.
              connection.query("select * from users where username = ?",[data.username],function(err,rows){
                  if (err)
                  {
                    connection.release();
                    return done(err);
                  }

                  if (!rows.length) {
                    //this check if the user exists in the database, if not throw a flash error to user
                    console.log("No user found");
                    connection.release();
                    return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
                  }
                  if (rows[0].failedLoginAttempts>1) {
                    //This section achieves the objective: 1) 3 failed consecutive login attempts using the same username results in a locked user account
                    //if the failedLoginAttempts field is greater than 2 then return an error to user saying the account is locked
                    console.log("Your account is locked");
                    connection.release();
                    return done(null, false, req.flash('loginMessage', 'Your account is locked.')); // req.flash is the way to set flashdata using connect-flash
                  }


                  // if the user is found we then check if the password is correct
                  const salt = rows[0].salt;
                  const hashpassword = bcrypt.hashSync(data.password,salt);
                  const storedpassword = rows[0].password;
                  console.log("New Password:"+hashpassword);
                  console.log("Stored Password:"+storedpassword)
                  if ( hashpassword !== storedpassword )//(!bcrypt.compareSync(data.password, rows[0].password))//if (!( rows[0].password == password))
                  {
                    //if the password is incorrect then we record the failure attempt in the database below
                    console.log("Password incorrect");
                    const newfailedcount = rows[0].failedLoginAttempts +1;//increment failed login count and update failed login count
                    console.log("Failed attempts: "+rows[0].failedLoginAttempts)
                    connection.query("update users set failedLoginAttempts= ? where username = ?",[newfailedcount,rows[0].username],function(err,result){
                      if (err)
                      {
                        connection.release();
                        return done(null, false, req.flash('loginMessage', 'Oops! Error updating your failed count.')); // create the loginMessage and save it to session as flashdata
                      }

                      connection.release();
                      return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
                    });

                  }
                  else {
                    //if the users password if correct then reset the failed attempt field to zero,0.
                    const newfailedcount = 0;
                    connection.query("update users set failedLoginAttempts= ? where username = ?",[newfailedcount,rows[0].username],function(err,result){
                      if (err)
                      {
                        connection.release();
                        return done(null, false, req.flash('loginMessage', 'Oops! Error updating your failed count.')); // create the loginMessage and save it to session as flashdata
                      }

                      console.log("hello,user has logged in");
                      //the remember checkbox if checked allow the user to extend their user session from 10 seconds default to 1 minute.
          						if (req.body.remember) {
                        console.log("Remember me");
          							req.session.cookie.maxAge =  60 * 1000; // allow user to extend there current session to an hours. Cookie expires after 1 minute //60 *
          						} else {
                        console.log("Dont Remember");
                        //req.session.cookie.expires= false;//set req.session.cookie.expires to false to enable the cookie to remain for only the duration of browser being open.
          						}

                      // all is well, return successful user
                      connection.release();
                      return done(null, rows[0]);
                    });

                  }
              });
            });

    		  });

        });

      }));

};
