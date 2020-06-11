var mysql = require('mysql');//mysql is required to connect to your mysql database

var pool =  mysql.createPool({
    connectionLimit : 100,
    host: 'localhost',
    port: 3306,//must specify the port of your mysql local instance in the mysql workbench
    user: "root", // username of your mysql instance
    password: "rheRhwjq12!@", // the password of your mysql local instance
    database: "mark", // the database you are working with in your mysql local instance 
    debug    :  false
});

exports.pool = pool;
