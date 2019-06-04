// Modules to run html server
const express = require('express');
const app = express();
const path = require('path');
const port = 3000;
// Extract and parse data from webpage
const bodyParser = require('body-parser');
// Handle file uploading
const formidable = require('formidable');
// Localstorage
var LocalStorage = require('node-localstorage').LocalStorage,
    localStorage = new LocalStorage('./scratch');
localStorage.clear();

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
    // var createStudents = "CREATE TABLE students (id INT AUTO_INCREMENT PRIMARY KEY, username varchar(255), email varchar(255), name varchar(255), password varchar(255))";
    // var createTeachers = "CREATE TABLE teachers (id INT AUTO_INCREMENT PRIMARY KEY, username varchar(255), email varchar(255), name varchar(255), password varchar(255), phone varchar(255), subjects varchar(255), availability varchar(255))";
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
    var getData = `SELECT * FROM ${localStorage.getItem("type")}s WHERE username = '${localStorage.getItem("username")}'`
    if (localStorage.getItem("type") == "student") {
        con.query(getData, function(err, result) {
            if (err) throw err;
            res.render("home.ejs", {
                name: result[0].name
            });
        });
    } else if (localStorage.getItem("type") == "teacher") {
        con.query(getData, function(err, result) {
            if (err) throw err;
            res.render("profile.ejs", {
                data: result[0],
                student: false
            });
        });
    } else {
        res.render("index.ejs");
    }
});

// Ibid
app.get('/login', function(req, res) {
    res.render('login.ejs');
});

// Ibid
app.get('/signup', function(req, res) {
    res.render('signup.ejs');
});

// Clears local storage and redirects to login/signup
app.get('/logout', function(req, res) {
    localStorage.clear();
    res.redirect('/');
});

app.get('/search', function(req, res) {
    res.render('search.ejs')
});

// Testing purposes only
app.get('/profile', function(req, res) {
    res.render('profile.ejs', {
        data: {
            'type': '',
            'username': '',
            'name': '',
            'email': '',
            'phone': '',
            'subjects': JSON.stringify([]),
            'availability': JSON.stringify(['','','','','']),
            'students': JSON.stringify([])
        }
    });
});

// Login post request made to `/login`
app.post('/login', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;

    var studentLogin = "SELECT username, password FROM students WHERE username = ? AND password = ?";
    var teacherLogin = "SELECT username, password FROM teachers WHERE username = ? AND password = ?";
    con.query(studentLogin + " UNION " + teacherLogin, [username, password, username, password], function (err, result) {
        if (err) throw err;
        if (result.length == 0) {
            console.log("Login Failed");
            res.render('login.ejs', {fail: true});
        } else {
            localStorage.setItem('username', username);
            con.query(studentLogin, [username, password], function (err, result) {
                if (err) throw err;
                if (result.length > 0) {
                    localStorage.setItem("type", "student");
                    res.redirect('/');
                } else {
                    localStorage.setItem("type", "teacher");
                    res.redirect('/');
                }
            });
        }
    });
});

// Signup post request made to `/signup` (signup form)
app.post('/signup', function(req, res) {
    // Global (student/teacher) variables fetched from form
    var accountType = req.body.accounttype;
    var username = req.body.username;
    var email = req.body.email;
    var name = req.body.name;
    var password = req.body.password;

    // If account is a teacher, fetch more vars
    if (accountType == "teacher") {
        var phone = '';
        phone = req.body.phone;

        var subjects = [];
        subjects = req.param('subjects');

        // Availability vars are seperated by lunch and afterschool per day
        // Data comes in an array with numbers 0-4
        var lunch = req.param('lunch');
        var afterSchool = req.param('afterSchool');
        // Each index represents a day of the week
        var availability = ['','','','',''];

        if (lunch == null) lunch = [];
        if (afterSchool == null) afterSchool = [];

        // Adds an `l` for each day the user is available at lunch
        for (var i = 0; i < lunch.length; i++) {
          availability[lunch[i]] += 'l';
        }

        // `a` when avaiable after school
        for (var i = 0; i < afterSchool.length; i++) {
          availability[afterSchool[i]] += 'a';
        }
    }

    // Data dictionary to be stored
    var data = {
        'type':accountType,
        'username':username,
        'email':email,
        'name':name,
        'password':password,
        'phone':phone,
        'subjects':JSON.stringify(subjects),
        'availability':JSON.stringify(availability)
    };

    console.log(data.subjects);

    // SQL queries are stored in variables for ease of editting
    // These queries check the student/teacher tables to see if the username is already registered
    var studentVerify = `SELECT * FROM students WHERE username = '${username}'`;
    var teacherVerify = `SELECT * FROM teachers WHERE username = '${username}'`;

    // These queries add a new entry into the teacher/student table
    var studentUpload = `INSERT INTO students (username, email, name, password, tutors) VALUES ("${username}", "${email}", "${name}", "${password}", '${JSON.stringify([])}')`;
    var teacherUpload = `INSERT INTO teachers (username, email, name, password, phone, subjects, availability, students) VALUES ("${username}", "${email}", "${name}", "${password}", "${phone}", '${data.subjects}', '${data.availability}', '${data.students}')`;

    // Verifies unique username, takes `upload` param for upload instructions
    function upload(accountType) {
        // If username not taken, exec upload query
        if (accountType == "student") {
            con.query(studentUpload, function(err, result) {
                if (err) throw err;
            });
        } else {
            con.query(teacherUpload, function(err, result) {
                if (err) throw err;
            });
        }

        // Store username and accountType to localstorage
        localStorage.setItem("username", username);
        localStorage.setItem("type", accountType);
        // Render new page
        res.redirect('/');
    }

    // Execute username verification query
    con.query(studentVerify, function (err,result) {
        if (err) throw err;
        if (result.length == 0) {
            con.query(teacherVerify, function (err,result) {
                if (err) throw err;
                if (result.length == 0) {
                    upload(accountType);
                } else {
                    res.render('signup.ejs', {fail: true});
                }
            });
        } else {
            res.render('signup.ejs', {fail: true});
        }
    });

    console.log(data);
});

app.post('/results', function(req, res) {
    var subjects = req.body.subjects;

    // Availability vars are seperated by lunch and afterschool per day
    // Data comes in an array with numbers 0-4
    var lunch = req.param('lunch');
    var afterSchool = req.param('afterSchool');
    // Each index represents a day of the week
    var availability = ['','','','',''];

    if (lunch == null) lunch = [];
    if (afterSchool == null) afterSchool = [];

    // Adds an `l` for each day the user is available at lunch
    for (var i = 0; i < lunch.length; i++) {
      availability[lunch[i]] += 'l';
    }

    // `a` when avaiable after school
    for (var i = 0; i < afterSchool.length; i++) {
      availability[afterSchool[i]] += 'a';
    }

    var searchSubjects = "SELECT * FROM teachers";
    var results = [];
    con.query(searchSubjects, function (err, result) {
        if (err) throw err;
        for (var i = 0; i < result.length; i++) {
            if (result[i].subjects.includes(subjects)) {
                results.push(result[i]);
            }
        }
        res.render('results.ejs', {data: results});
    });
});

app.post('/profile', function(req, res) {
    var username = req.body.username;
    var query = "SELECT * FROM teachers WHERE username = ?";

    con.query(query, [username], function(err, result) {
        if (err) throw err;
        res.render('profile.ejs',{data:result[0],student:true});
    });
});

app.listen(port);
