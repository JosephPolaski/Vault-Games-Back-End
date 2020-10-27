require('dotenv').config();      // require for environment variables
var mysql = require('mysql');   // Require MySQL

// Build Pool
var pool = mysql.createPool({
    connectionLimit :   10,
    host            :   process.env.VAULT_HOST,
    user            :   process.env.VAULT_USER,
    password        :   process.env.VAULT_PASS,
    database        :   process.env.VAULT_DB_NAME
});

//Export Module
module.exports.pool = pool;