var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
const sessions = require('express-session');
var path = require('path');

// creating 24 hours from milliseconds
const oneDay = 1000 * 60 * 60 * 24;

//session middleware
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false
}));

//use body-parser
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
//use cookie
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'pages'))); 

//Routing
const apiRoutes = require("./apiRoutes")

app.use("/", apiRoutes)

console.log("Server is listnening at port: 8080")
app.listen(8080)
