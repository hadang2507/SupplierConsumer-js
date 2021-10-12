var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.use(cookieParser())

const apiRoutes = require("./apiRoutes")

app.use("/", apiRoutes)

console.log("Server is listnening at port: 8080")
app.listen(8080)
