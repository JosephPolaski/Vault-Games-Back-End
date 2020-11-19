//Import Environment Variables
require('dotenv').config()  

//Configure App and requirements

// requiring the pool created
var mysql = require('./dbcon.js');

// requiring Cross Origin Resource Sharing
var cors = require('cors');


const express = require('express');
const app = express();

// This is for security so the port is not shown
const port = process.env.PORT;

// BUILD QUERY STRINGS

// GET Queries
// 
// Showing all customers
const queryAllCustomers = 'SELECT * FROM customers' ;

// Showing all products
const queryAllProducts = 'SELECT * FROM products' ;

// Showing all Addresses
const queryAllAddresses = 'SELECT * FROM addresses' ;

// Count of all customers
const customerCount = 'SELECT COUNT(customers.customer_id) AS custCount FROM customers' ;

// Count of all completed orders
const completedOrders = "SELECT COUNT(order_status) AS completeOrders FROM orders WHERE order_status = 'Filled'" ;

// Sum of all available products
const availableProducts = 'SELECT SUM(products.quantity) AS availableProducts FROM products'

// Get Request to return all customers
app.get('/allCustomers', (req, res, next) => {
  var context = {};
  // makes the query -- stores results here using the pool we created in DBCon
  mysql.pool.query(queryAllCustomers, (error, results, fields) => {
    // check for any returned error
    if(error){
      next(error); // parse all errors if multiple
      return;
    }
    context.results = results; // add/update context results
    console.log(context.results) // prints to console for server.
    res.send(context); // send context object
  });
});

// Get Request to return all products
app.get('/allProducts', (req, res, next) => {
  var context = {};
  mysql.pool.query(queryAllProducts, (error, results, fields) => {
    if(error){
      next(error);
      return;
    }
    context.results = results; 
    console.log(context.results) 
    res.send(context);
  });
});

// Get Request to return all addresses
app.get('/allAddresses', (req, res, next) => {
  var context = {};
  mysql.pool.query(queryAllAddresses, (error, results, fields) => {
    if(error){
      next(error);
      return;
    }
    context.results = results; 
    console.log(context.results) 
    res.send(context);
  });
});


// **************** INFO BOXES AND DASHBOARD***************** //

// Get Request to return total customer count
app.get('/customerCount', (req, res, next) => {
  var context = {};
  // makes the query -- stores results here using the pool we created in DBCon
  mysql.pool.query(customerCount, (error, results, fields) => {
    // check for any returned error
    if(error){
      next(error); // parse all errors if multiple
      return;
    }
    context.results = results; // add/update context results
    console.log(context.results) // prints to console for server.
    res.send(context); // send context object
  });
});

// Get Request to return total filled orders
app.get('/completedOrders', (req, res, next) => {
  var context = {};
  // makes the query -- stores results here using the pool we created in DBCon
  mysql.pool.query(completedOrders, (error, results, fields) => {
    // check for any returned error
    if(error){
      next(error); // parse all errors if multiple
      return;
    }
    context.results = results; // add/update context results
    console.log(context.results) // prints to console for server.
    res.send(context); // send context object
  });
});

// Get Request to return total available products
app.get('/availableProducts', (req, res, next) => {
  var context = {};
  // makes the query -- stores results here using the pool we created in DBCon
  mysql.pool.query(availableProducts, (error, results, fields) => {
    // check for any returned error
    if(error){
      next(error); // parse all errors if multiple
      return;
    }
    context.results = results; // add/update context results
    console.log(context.results) // prints to console for server.
    res.send(context); // send context object
  });
});



app.listen(port, () => {
  console.log(`Example app listening at http://flip3.engr.oregonstate.edu:${port}`)
});
