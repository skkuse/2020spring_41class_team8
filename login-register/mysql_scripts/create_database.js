
CREATE SCHEMA `mark` ;
CREATE TABLE `mark`.`users` (
 `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
 `username` VARCHAR(45) NOT NULL,
 `password` VARCHAR(60) NOT NULL,
 PRIMARY KEY (`id`),
 UNIQUE INDEX `id_UNIQUE` (`id` ASC),
 UNIQUE INDEX `username_UNIQUE` (`username` ASC));

ALTER TABLE `mark`.`users`
ADD COLUMN `failedLoginAttempts` INT(11) NOT NULL DEFAULT 0 AFTER `password`;

ALTER TABLE `mark`.`users`
ADD COLUMN `salt` VARCHAR(60) NOT NULL AFTER `failedLoginAttempts`;


CREATE TABLE `mark`.`ipslocked` (
  `ipaddress` VARCHAR(45) NOT NULL,
  `lastLockedTime` DATETIME NULL,
  PRIMARY KEY (`ipaddress`),
  UNIQUE INDEX `ipaddress_UNIQUE` (`ipaddress` ASC));


/*
  Dont copy comments
*/
/*

The mysql database for this project consists of the following two tables, `users` and `ipslocked`. There are no relationships between these two tables based on the project requirements.

* `users`- a table where all users for the app is stored. It contains three fields as follows:
  1. `id (INT)`- this is an auto-incremented index field that increments when a new row is added to the table. The entries into this field not be unique, not null and is the primary key of the table.
  2. `username (VARCHAR(45))`- this is where the username, the user enters is stored as a string. The username must also be unique and not null.
  3. `password (VARCHAR(60))`- this is where the encrypted password is stored as a string. The password must be not null.
  4. `salt (VARCHAR(60))`- this is the encryption key for the particular password stored as a string. It  provides extra encryption to your password and is stored so that it can be used when checking if the password entered by user is matches the password stored.
  5. `failedloginAttempts (INT(11))`- this is count of the number of times the user has entered an incorrect password for the particular username. The count is stored in an int field and is later reset to 0 when the user enters the correct password.

* `ipslocked` - a table that stores all IP addresses that have crossed the brute force prevention limit for this app. This limit is 13 failed logins within 10 minutes regardless of username. It contains two fields as follows:
  1. `ipaddress (VARCHAR(45))`- this is where the user's IP address is stored once they have crossed the brute force prevention limit. It must be unique, not null and is the primary key of the table.
  2. `lastLockedTime (DATETIME)`- this is the timestamp being record of when the user had crossed the brute force prevention limit. This field is reset to null once 20 minutes has passed and the user tries to sign in again. The entries in this field can be null.

  */
