var express = require('express');
var app = express();


const apiRoutes = require("./routes/apiRoutes")

app.use("/", apiRoutes)

console.log("Server is listnening at port: 8080")
app.listen(8080)