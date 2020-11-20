//Import Environment Variables
require('dotenv').config()  

//Configure App and requirements

// requiring the pool created
var mysql = require('./dbcon.js');

// requiring Cross Origin Resource Sharing
var cors = require('cors');

const express = require('express');
const app = express();
app.use(express.json());

// This is for security so the port is not shown
const port = process.env.PORT;

// *****************************
// ********** Queries **********
// *****************************

// ***********************
// ****** Customers ******
// ***********************
// Showing all customers
const queryAllCustomers = 'SELECT * FROM customers' ;
const insertCustomer = 'INSERT INTO customers(`first_name`, `last_name`, `email`) VALUES (?, ?, ?)' ;

// **********************
// ****** Products ******
// **********************
// Showing all products
const queryAllProducts = 'SELECT * FROM products' ;

// ***********************
// ****** Addresses ******
// ***********************
// Showing all Addresses
const queryAllAddresses = 'SELECT * FROM addresses' ;

// *******************************
// ****** AGGREGATE QUERIES ******
// *******************************

// Count of all customers
const customerCount = 'SELECT COUNT(customers.customer_id) AS custCount FROM customers' ;

// Count of all completed orders
const completedOrders = "SELECT COUNT(order_status) AS completeOrders FROM orders WHERE order_status = 'Filled'" ;

// Sum of all available products
const availableProducts = 'SELECT SUM(products.quantity) AS availableProducts FROM products'

// **********************************
// ********** GET REQUESTS **********
// **********************************

// ****** CUSTOMERS ******
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

// AGGREGATE Request to return total customer count
app.get('/customerCount', (req, res, next) => {
  var context = {};
  mysql.pool.query(customerCount, (error, results, fields) => {
    if(error){
      next(error); 
      return;
    }
    context.results = results; 
    console.log(context.results) 
    res.send(context); 
  });
});

// ****** PRODUCTS ******
// Return all products
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

// AGGREGATE Request to return total available products
app.get('/availableProducts', (req, res, next) => {
  var context = {};
  mysql.pool.query(availableProducts, (error, results, fields) => {
    if(error){
      next(error); 
      return;
    }
    context.results = results; 
    console.log(context.results) 
    res.send(context); 
  });
});

// ****** ADDRESSES ******
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

// ****** ORDERS ******
// Get Request to return total filled orders
app.get('/completedOrders', (req, res, next) => {
  var context = {};
  mysql.pool.query(completedOrders, (error, results, fields) => {
    if(error){
      next(error); 
      return;
    }
    context.results = results; 
    console.log(context.results) 
    res.send(context); 
  });
});

// ***********************************
// ********** POST REQUESTS **********
// ***********************************

// ***********************
// ****** CUSTOMERS ******
// ***********************

// const insertCustomer = 'INSERT INTO customers(`first_name`, `last_name`, `email`) VALUES (?, ?, ?)' ;

// ****** INSERT ******
app.post('/insertCustomer' , (req,res,next) => {
  var context = {};
  // Object destructuring -- stores following properties from that object and
  // storing them into variables with the following names
  var first_name = req.body['first_name']; 
  var last_name = req.body['last_name'];
  var {first_name, last_name, email} = req.body;
  mysql.pool.query(
      insertCustomer,
      [first_name, last_name, email],
      // call back occurs once query is completed
      (err, result) => {
        if(err){
          next(err);
          return;
    }
    res.send(`You have added ${first_name} ${last_name}`);
  });
});


app.listen(port, () => {
  console.log(`Example app listening at http://flip3.engr.oregonstate.edu:${port}`)
});
