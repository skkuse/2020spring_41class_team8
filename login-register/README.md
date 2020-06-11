# My Medullun Submission by Mark Springer

## Synopsis

This project is a basic login and register web application built using Node-Express using EJS templates and MySQL. For this project there are four web pages as follows:

* Index (Home) page: `views/ejs/index.js` - This page is the home page and the default page shown to the user. It contains only a navigation to the login and register pages.
* Register page: `views/ejs/register.js` - This page is the register page where you can create a new user for the website by inputing a username and password.
* Login page: `views/ejs/login.js` - This page is the login page where you can log into your account with username and password. The login page has extra protection features to prevent unwanted attackers from accessing an account. The extra protection features are as follows:

    1. Enter an incorrect password three times for a particular user and your account would be locked. A successful login also resets the amount failed attempts made before the account is locked.

    2. Entering random usernames and passwords 13 times in the span of 10 minutes would result in your ipaddress being block from logging in for 20 minutes.

    3. When logging in, if you do check the 'Remember Me' checkbox then your active session is 1 minute long. If you dont then your active session is 10 seconds long. Then you will be logged out again.

    4. Your password is encrypted using a salt, which is the maximum security I know to put on password policies.

* Profile page: `view/ejs/profile.js` - When a user successfully registers or logs, the user can view their username, encrypted password and id.

## Prerequisites

This project is built with Nodejs and a MySQL so the following software are required to be installed.

1. Download and install nodejs and the npm package manager with this link: https://nodejs.org/en/download/
2. You must download MySQL Server and MySQL Workbench using the mysql installer, follow this link: https://dev.mysql.com/downloads/installer/

## Installation Instructions

To install this project you complete the instructions set below.

1. Open MySQL workbench and create a local instance and record the port, user and password when creating the instance.
2. Open the npm package console window that comes installed with nodejs
3. Clone  or download the zip for this repo: git clone https://github.com/panmaestros/my_login_app.git
4. Go to the directory of the clone project in your npm package console window.
5. Install packages by running this command: `npm install`
6. Edit the mysql.js database configuration file with the port, user and password from the mysql local instance you created above : `mysql.js`
7. Create the database schema in the mysql instance by copying the entire MySQL code in the create_database.js file and pasting it into a new Query window in your MySQL instance : `mysql_scripts/create_database.js`
8. Launch the app by using this command: `npm start`
9. Visit in your browser at: http://localhost:8080

## Client & Server Object Model Explained

Data is sent between the client (ejs template pages) and the server through routes. The routes can then transport data between the server and client in the form of JSON objects or entire EJS rendered pages or both.

Examples of Client to Server in this app:

In the `login.ejs` page, when the user presses the login button, a json object is sent to the server in the following format:
`{usename:"mark", password:"test", remember:"on"}`. This data is sent to route `/login`, in the form of a post to secure the data and the server would respond by sending a rendered ejs page, either `profile.ejs` if the user login was successful or `login.ejs`, with a error message in the form of a json object, if the login process was unsuccessful. The `remember` key in the object is optional, if it is not sent in the object the user session would only last 10 seconds.

Similarly in the `register.ejs` page, when the user presses the register button, a json object is sent to the server in the following format:
`{usename:"mark", password:"test", confirm:"test"}`. Again, this data is sent to route `/register`, in the form of a post to secure the data and the server would respond by sending a rendered ejs page, either  `profile.ejs` if the user login was successful or `register.ejs`, with a error message in the form of a json object, if the register process was unsuccessful.


## Database Data Model Explained

The MySQL database for this project consists of the following two tables, `users` and `ipslocked`. There are no relationships between these two tables based on the project requirements.

* `users`- a table where all users for the app is stored. It contains three fields as follows:
  1. `id (INT)`- this is an auto-incremented index field that increments when a new row is added to the table. The entries into this field must be unique, not null, and this field is the primary key of the table.
  2. `username (VARCHAR(45))`- this is where the username, the user enters is stored as a string. The username must also be unique and not null.
  3. `password (VARCHAR(60))`- this is where the encrypted password is stored as a string. The password must be not null.
  4. `salt (VARCHAR(60))`- this is the encryption key for the particular password stored as a string. It  provides extra encryption to your password and is stored so that it can be used when checking if the password entered by user is matches the password stored.
  5. `failedLoginAttempts (INT(11))`- this is a count of the number of times the user has entered an incorrect password for the particular username. The count is stored in an INT field and is later reset to 0 when the user enters the correct password.

* `ipslocked` - a table that stores all IP addresses that have crossed the brute force prevention limit for this app. This limit is 13 failed logins within 10 minutes regardless of username. It contains two fields as follows:
  1. `ipaddress (VARCHAR(45))`- this is where the user's IP address is stored once they have crossed the brute force prevention limit. It must be unique, not null and is the primary key of the table.
  2. `lastLockedTime (DATETIME)`- this is the timestamp being record of when the user had crossed the brute force prevention limit. This field is reset to null once 20 minutes has passed and the user tries to sign in again. The entries in this field can be null.


## Tests
You can perform the following tests on the system to ensure proper functionality.

1. Register a new user on the register page and you should register successfully and be taken to your profile.
2. Refresh your page after 10 seconds and you should be logged out.
3. Go to your login page and login with your correct credentials and check the remember box and you should be logged in successfully. You would also get an extended session for 1 minute. After 1 minute you should then be logged out.
4. Enter an incorrect password for your account more than 2 times and your account should be locked. To get access back into your account go to the database and set the field `failedLoginAttempts` in the `users` table back to 0.
5. To test the brute force prevention limit follow these steps.
    * You should first stop your server `press ctrl + c`. then go to your `server.js` file in your project.
    * Search for a variable called `testmode`, and set it to `true`. This will change the settings of your brute force prevention limit from `13 requests every 10 minutes and lock your account for 20 minutes` to `3 requests every 10 seconds and lock your account for 1 minute`.
    * Then save and restart the server, `npm start`. Go to your login page, `localhost:8080/login`.
    * Manually enter 3 random usernames and passwords within 10 seconds and on the third attempt your request will be blocked.
    * You can then check after 10 seconds that you still will not be able to access your account until 1 minute has passed.




## API Reference

* User Authentication was built using Passport API:[https://github.com/jaredhanson/passport]
* Connection and querying of the MySQL database was done using MySQL API: [https://github.com/mysqljs/mysql]
* Session management was done using Express Session and Cookie Parser API: [https://github.com/expressjs/session] & [https://github.com/expressjs/cookie-parser]
* Password encryption was done using Bcrypt API: [https://www.npmjs.com/package/bcrypt-nodejs]
* EJS was used as the templating language to built the webUI pages: [https://github.com/tj/ejs]
* Brute force attack prevention was done using Express Rate Limit API: [https://github.com/nfriedly/express-rate-limit]

## Disclaimer Notes

* This project will not be maintained or updated anymore.
* This project was not built using the latest ES6 syntax and Promises. This was mainly due to the libraries and the node version being used. As such this project may be outdated soon.
