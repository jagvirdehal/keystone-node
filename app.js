// Modules to run html server
const express = require('express');
const app = express();
const path = require('path');
const port = 3000;
// Extract and parse data from webpage
const bodyParser = require('body-parser');
// Handle file uploading
const formidable = require('formidable');

// MySQL module init + settings
const mysql = require('mysql');
const con = mysql.createConnection({
  host: "keystonetutor.mysql.database.azure.com",
  user: "Keystone@keystonetutor",
  password: 'Test1234',
  database: 'Keystone',
  port: 3306,
});

// Establish connection
// con.connect(function(err) {
//   if (err) throw err;
//   console.log("Connected to MySQL");
//
// });

// Express module setup
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

// Renders `index.ejs` at the `/` directory
app.get('/', function(req, res) {
  res.render('index.ejs');
});

// Ibid
app.get('/login', function(req, res) {
  res.render('login.ejs');
});

// Ibid
app.get('/signup', function(req, res) {
  res.render('signup.ejs');
});

// Post request made to `/` dir (form submit from signup.ejs)
app.post('/', function(req,res) {
  // Data dictionary to be stored
  var data = {
    'type':'',
    'username':'',
    'email':'',
    'password':'',
    'phone':'',
    'subjects':[],
    'availability':[]
  };
  // Global (student/teacher) variables fetched from form
  var accountType = req.body.accounttype;
  var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;

  // If account is a teacher, fetch more vars
  if (accountType == "teacher") {
    var phone = req.body.phone;
    var subjects = req.param('subjects');

    // Availability vars are seperated by lunch and afterschool per day
    // Data comes in an array with numbers 0-4
    var lunch = req.param('lunch');
    var afterSchool = req.param('afterSchool');
    // Each index represents a day of the week
    var availability = ['','','','',''];

    // Adds an `l` for each day the user is available at lunch
    for (var i = 0; i < lunch.length; i++) {
      availability[lunch[i]] += 'l';
    }

    // `a` when avaiable after school
    for (var i = 0; i < afterSchool.length; i++) {
      availability[afterSchool[i]] += 'a';
    }
  }

  con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
    var studentVerify = "SELECT * FROM students WHERE username = '" + username + "'";
    var teacherVerify = "SELECT * FROM teachers WHERE username = '" + username + "'";
    con.query(studentVerify, function (err,result) {
      if (err) throw err;
      console.log(result);
    });
    con.query(teacherVerify, function (err,result) {
      if (err) throw err;
      console.log(result);
    });
  });

  console.log(username,email,password,accountType);
  res.render('index.ejs');
});

app.listen(port);
