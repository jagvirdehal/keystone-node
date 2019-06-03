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
    database: 'keystone',
    port: 3306,
});

// Establish connection
con.connect(function(err) {
    if (err) throw err;
    console.log("Connected to MySQL");
    // var createTeachers = "CREATE TABLE teachers (id INT AUTO_INCREMENT PRIMARY KEY, username varchar(255), email varchar(255), name varchar(255), password varchar(255), phone varchar(255), subjects varchar(255), availability varchar(255))";
    // var createStudents = "CREATE TABLE students (id INT AUTO_INCREMENT PRIMARY KEY, username varchar(255), email varchar(255), name varchar(255), password varchar(255))";
    con.query("SELECT * FROM students", function(err, result, fields) {
        if (err) throw err;
        console.log(result);
    });
});

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
/* app.post('/', function(req,res) {
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
    var name = req.body.name;
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

    // SQL queries are stored in variables for ease of editting
    // These queries check the student/teacher tables to see if the username is already registered
    var studentVerify = "SELECT * FROM students WHERE username = '" + username + "'";
    var teacherVerify = "SELECT * FROM teachers WHERE username = '" + username + "'";

    // These queries add a new entry into the teacher/student table
    var studentUpload = `INSERT INTO students (username, email, name, password)
        VALUES (${username}, ${email}, ${name}, ${password})`;
    var teacherUpload = `INSERT INTO students (username, email, name, password, phone, subjects, availability)
        VALUES (${username}, ${email}, ${name}, ${password}, ${phone}, ${JSON.stringify(subjects)}, ${JSON.stringify(availability)})`;

    // Student verification query
    con.query(studentVerify, function (err,result) {
        if (err) throw err;
        console.log(result);

        // If username not taken, exec studentUpload query
        if (result == []) {
            con.query(studentUpload, function(err, result) {
              if (err) throw err;
              console.log(result);
            });
        }
    });

    // Teacher verification query
    con.query(teacherVerify, function (err,result) {
        if (err) throw err;
        console.log(result);

        // If no teachers with same username, execute teacherUpload query
        if (result == []) {
            con.query(teacherUpload, function(err, result) {
                if (err) throw err;
                console.log(result);
            });
        }
    });

    console.log(username,email,password,accountType);
    res.render('index.ejs');
}); */

app.listen(port);
