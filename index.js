//Import Environment Variables
require('dotenv').config()  

//Configure App and requirements
var mysql = require('./dbcon.js');
var cors = require('cors');
const express = require('express');
const app = express();
const port = process.env.PORT;

// BUILD QUERY STRINGS
const queryAll = 'SELECT * FROM bsg_people' ;

// Simple Get Request to Root DIR
app.get('/', (req, res, next) => {
  var context = {};
  mysql.pool.query(queryAll, (error, results, fields) => {
    // check for any returned error
    if(error){
      next(error); // parse all errors if multiple
      return;
    }
    context.results = results; // add/update context results
    console.log(context.results)
    res.send(context); // send context object
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://flip1.engr.oregonstate.edu:${port}`)
});