//Import Environment Variables
require('dotenv').config()  

//Configure App and requirements

// requiring the pool created
var mysql = require('./dbcon.js');

// requiring Cross Origin Resource Sharing
var CORS = require('cors');

const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(CORS());

const url = require('url');

// Access-Controll-Allow
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // set domain to client
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");  
  next();
});

// This is for security so the port is not shown
const port = process.env.PORT;

// *****************************
// ********** Queries **********
// *****************************

// ***********************
// ****** Customers ******
// ***********************
const queryAllCustomers = 'SELECT * FROM customers' ;
const insertCustomer = 'INSERT INTO customers(`first_name`, `last_name`, `email`) VALUES (?, ?, ?)' ;

// When a customer is deleted, all of the addresses of that customer are also deleted
const deleteCustomer = `DELETE addresses
                        FROM addresses
                        JOIN customer_addresses ON addresses.address_id = customer_addresses.address_id
                        JOIN customers ON customer_addresses.customer_id = customers.customer_id
                        WHERE customers.customer_id = ?;
                        DELETE FROM customers WHERE customer_id = ?`

// ***********************
// ****** Orders *********
// ***********************
const queryAllOrders = `SELECT orders.order_id, CONCAT(customers.first_name," ",customers.last_name), orders.order_status, orders.date_ordered, orders.total_price
                        FROM orders
                        JOIN products_purchased ON orders.order_id = products_purchased.order_id
                        JOIN customers ON products_purchased.customer_id = customers.customer_id
                        GROUP BY orders.order_id  
                        ORDER BY orders.order_id ASC` ;

// **********************
// ****** Products ******
// **********************
const queryAllProducts = 'SELECT * FROM products' ;
const insertProduct = 'INSERT INTO products (`title`, `publisher`, `platform`, `genre`, `rating`, `quantity`, `price`) VALUES (?, ?, ?, ?, ?, ?, ?)' ;

// ***********************
// ****** Addresses ******
// ***********************
const queryAllAddresses = `SELECT addresses.address_id, customers.first_name, customers.last_name, addresses.line_1, addresses.city, addresses.state, addresses.zip_code
                           FROM customers
                           JOIN customer_addresses ON customer_addresses.customer_id = customers.customer_id
                           JOIN addresses ON customer_addresses.address_id = addresses.address_id`

const insertAddress = 'INSERT INTO addresses(`line_1`, `line_2`, `apt_num`, `city`, `zip_code`, `state`) VALUES (?, ?, ?, ?, ?, ?)' ;

const updateAddresses = `UPDATE addresses 
                        SET line_1 = ?, line_2 = ?, apt_num = ?, city = ?, zip_code = ?, state = ? 
                        WHERE address_id = ?`

// *******************************
// ****** AGGREGATE QUERIES ****** 
// *******************************

// Count of all customers
const customerCount = 'SELECT COUNT(customers.customer_id) AS custCount FROM customers' ;

// Count of all completed orders
const completedOrders = "SELECT COUNT(order_status) AS completeOrders FROM orders WHERE order_status = 'Filled'" ;

// Sum of all available products
const availableProducts = 'SELECT SUM(products.quantity) AS availableProducts FROM products'

// Full aggregate query that pulls in all three:
const fullCount = `SELECT COUNT(customers.customer_id) AS cpo
                    FROM customers
                    UNION
                    SELECT SUM(products.quantity)
                    FROM products
                    UNION
                    SELECT COUNT(orders.order_status)
                    FROM orders
                    WHERE orders.order_status = 'Filled'` ;

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

// CUSTOMER SEARCH
app.get('/customerSearch' , (req,res,next) => {

  let strip1 = req.url.split("?");
  let strip2 = strip1[1].split("&");
  let strip3 = strip2[0].split("=");
  let lname = strip3[1];

  var context = {};   
  mysql.pool.query(
    `SELECT *
    FROM customers
    WHERE customers.last_name LIKE '%` +lname+ `%'`,
    // call back occurs once query is completed
    (error, results, fields) => {
      if(error){
        next(error);
        return;
      }
  
      context.results = results; 
      res.send(context);
  });
});

// AGGREGATE Request to return total customer count
app.get('/fullCount', (req, res, next) => {
  var context = {};
  mysql.pool.query(fullCount, (error, results, fields) => {
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

// HELPER FOR PRODUCT SEARCH
function replaceAll(productString, characterToReplace, replace) {
  return productString.split(characterToReplace).join(replace);
}

// PRODUCT SEARCH
app.get('/productSearch' , (req,res,next) => {

  let strip1 = req.url.split("?");
  let strip2 = strip1[1].split("=");
  let urlProductTitle = strip2[1];

  let productTitle = replaceAll(urlProductTitle, '%20', ' ');

  console.log(productTitle);

  var context = {};   
  mysql.pool.query(
    `
    SELECT *
    FROM products
    WHERE products.title LIKE '%` +productTitle+ `%'`,
    // call back occurs once query is completed
    (error, results, fields) => {
      if(error){
        next(error);
        return;
      }
  
      context.results = results; 
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

// ADDRESS SEARCH BY CUSTOMER
app.get('/addressSearch' , (req,res,next) => {

  let strip1 = req.url.split("?");
  let strip2 = strip1[1].split("&");
  let strip3 = strip2[0].split("=");
  let lname = strip3[1];

  var context = {};   
  mysql.pool.query(
    `SELECT addresses.address_id, customers.first_name, customers.last_name, addresses.line_1, addresses.city, addresses.state, addresses.zip_code
    FROM customers
    JOIN customer_addresses ON customer_addresses.customer_id = customers.customer_id
    JOIN addresses ON customer_addresses.address_id = addresses.address_id
    WHERE customers.last_name LIKE '%` +lname+ `%'`,

    // call back occurs once query is completed
    (error, results, fields) => {
      if(error){
        next(error);
        return;
      }
  
      context.results = results; 
      res.send(context);
  });
});

// ****** ORDERS ******
// AGGREGATE Get Request to return total filled orders
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

// ****** Orders ******
// Return all orders
app.get('/allOrders', (req, res, next) => {
  var context = {};
  mysql.pool.query(queryAllOrders, (error, results, fields) => {
    if(error){
      next(error);
      return;
    }
    context.results = results; 
    console.log(context.results) 
    res.send(context);
  });
});

// ORDER HISTORY 
app.get('/orderHistory' , (req,res,next) => {

  let strip1 = req.url.split("?");
  let strip2 = strip1[1].split("&");
  let strip3 = strip2[0].split("=");
  let strip4 = strip2[1].split("=");
  let fname = strip3[1];
  let lname = strip4[1];

  var context = {};   
  mysql.pool.query(
    `SELECT orders.order_id, CONCAT(customers.first_name, " ", customers.last_name), orders.order_status, orders.date_ordered, orders.total_price
    FROM orders 
    JOIN products_purchased ON orders.order_id = products_purchased.order_id
    JOIN customers ON products_purchased.customer_id = customers.customer_id
    AND customers.first_name = "`+ fname +`"AND customers.last_name = "` + lname + `"
    GROUP BY orders.order_id`,
    // call back occurs once query is completed
    (error, results, fields) => {
      if(error){
        next(error);
        return;
      }
  
      context.results = results; 
      res.send(context);
  });
});

// ***********************************
// ********** POST REQUESTS **********
// ***********************************

// ***********************
// ****** CUSTOMERS ******
// ***********************

// ****** INSERT ******
// Using Query:
// insertCustomer = 'INSERT INTO customers(`first_name`, `last_name`, `email`) VALUES (?, ?, ?)'
app.post('/insertCustomer' , (req,res,next) => {
  console.log(req.body);
  // Object destructuring -- stores following properties from that object and
  // storing them into variables with the following names
  var fname = req.body['first_name']; 
  var lname = req.body['last_name'];
  var {fname, lname, email} = req.body;  
  mysql.pool.query(
      insertCustomer,
      [fname, lname, email],
      // call back occurs once query is completed
      (err, result) => {
        if(err){
          next(err);
          return;
    }
    res.send(`You have added ${fname} ${lname}`);
  });
});

// insertCustAddr
// creates M:M relationship
app.post('/insertCustAddress' , (req,res,next) => {
  console.log(req.body);
  // Object destructuring -- stores following properties from that object and
  // storing them into variables with the following names
  var cid = req.body['cid']; 
  var addr1 = req.body['addr1'];
  var addr2 = req.body['addr2'];
  var city = req.body['city'];
  var state = req.body['state']
  var zip = req.body['zip']

  mysql.pool.query(
      `INSERT INTO 
       addresses(line_1, line_2, apt_num, city, zip_code, state) 
       VALUES ('`+ addr1 +`', '`+ addr2 +`','NULL','`+ city +`','`+ zip +`','`+ state +`');       
       SET @address_id = LAST_INSERT_ID();       
       INSERT INTO 
       customer_addresses(customer_id, address_id) 
       VALUES
       (`+ cid +`, @address_id);`,
      // call back occurs once query is completed
      (err, result) => {
        if(err){
          next(err);
          return;
    }
    res.send(`Great Success!`);
  });
});

// ***********************
// ****** ADDRESSES ******
// ***********************

// ****** INSERT ******
// Using Query:
// insertAddress = 'INSERT INTO addresses(`line_1`, `line_2`, `apt_num`, `city`, `zip_code`, `state`) VALUES (?, ?, ?, ?, ?, ?);'
app.post('/insertAddress' , (req,res,next) => {
  var context = {};
  // Object destructuring -- stores following properties from that object and
  // storing them into variables with the following names
  var main_address = req.body['line_1']; 
  console.log(req.body)
  var {line_1, line_2, apt_num, city, zip_code, state} = req.body;
  mysql.pool.query(
      insertAddress,
      [line_1, line_2, apt_num, city, zip_code, state],
      // call back occurs once query is completed
      (err, result) => {
        if(err){
          next(err);
          return;
    }
    res.send(`You have added ${main_address}`);
  });
});

// **********************
// ****** PRODUCTS ******
// **********************

// ****** INSERT ******
// Using Query:
// insertProduct = 'INSERT INTO products (`title`, `publisher`, `platform`, `genre`, `rating`, `quantity`, `price`) VALUES (?, ?, ?, ?, ?, ?, ?)'
app.post('/insertProduct' , (req,res,next) => {
  // Object destructuring -- stores following properties from that object and
  // storing them into variables with the following names
  var product_name = req.body['title']; 
  console.log(req.body)
  var {title, publisher, platform, genre, rating, quantity, price} = req.body;
  mysql.pool.query(
      insertProduct,
      [title, publisher, platform, genre, rating, quantity, price],
      // call back occurs once query is completed
      (err, result) => {
        if(err){
          next(err);
          return;
    }
    res.send(`You have added ${product_name}`);
  });
});

// ********************
// ****** ORDERS ******
// ********************

// INSERT CUSTOMER ORDER
app.post('/insertCustOrder' , (req,res,next) => {
  console.log(req.body)
  
  //Object destructuring -- stores following properties from that object and
  //storing them into variables with the following names
  let cid = req.body['cid'];
  let pid = req.body['itemID[]']; // no idea why the keys have [] at the end
  let quant = req.body['itemQuantities[]'];
  let price = req.body['total'];
  let order_num = 0;
 
  mysql.pool.query(
      `INSERT INTO orders (customer_id, order_status, date_ordered, total_price) VALUES
      (`+cid+`, 'Opened', CURRENT_DATE, `+price+`)`,
      // call back occurs once query is completed
      (err, result) => {
        if(err){
          next(err);
          return;
        }
    res.send('Order Added Successfully');
  });
  
});

// *************************************
// ********** DELETE REQUESTS **********
// *************************************


// ***********************
// ****** ADDRESSES ******
// ***********************
app.delete('/deleteAddress' , (req,res,next) => {
  console.log(req.body)
  let aid = req.body['aid'];
  console.log(aid)

  mysql.pool.query(
      `
      DELETE FROM addresses WHERE address_id = `+aid+`;` ,
      // call back occurs once query is completed
      (err, result) => {
        if(err){
          next(err);
          return;
    }
    res.send('Customer Address Removed');
  });
  
});

// ***********************
// ****** CUSTOMERS ******
// ***********************

app.delete('/deleteCustomer' , (req,res,next) => {
  console.log(req.body)
  let cid = req.body['cid'];
  console.log(cid)

  mysql.pool.query(
    `
    DELETE addresses
    FROM addresses
    JOIN customer_addresses ON addresses.address_id = customer_addresses.address_id
    JOIN customers ON customer_addresses.customer_id = customers.customer_id
    WHERE customers.customer_id = `+cid+`;
    DELETE FROM customers WHERE customer_id = `+cid+`;`,
      // call back occurs once query is completed
      (err, result) => {
        if(err){
          next(err);
          return;
    }
    res.send('Customer Address Removed');
  });
  
});

// *************************************
// ********** UPDATE REQUESTS **********
// *************************************

// ***********************
// ****** ADDRESSES ******
// ***********************
// updateAddresses = 'UPDATE addresses SET line_1 = ?, line_2 = ?, apt_num = ?, city = ?, zip_code = ?, state = ? WHERE address_id = ?'
app.put('/updateAddress' , (req,res,next) => {
  // Object destructuring -- stores following properties from that object and
  // storing them into variables with the following names
  var addressUpdate = req.body['address']; 
  console.log(req.body)
  var {line_1, line_2, apt_num, city, zip, state, aid} = req.body;
  mysql.pool.query(
      updateAddresses,
      [line_1, line_2, apt_num, city, zip, state, aid],
      // call back occurs once query is completed
      (err, result) => {
        if(err){
          next(err);
          return;
    }
    res.send(`You have updated the address`);
  });
});

app.listen(port, () => {
  console.log(`Vault Games Server listening at http://flip1.engr.oregonstate.edu:${port}`)
});
