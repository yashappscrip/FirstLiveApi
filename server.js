const express = require('express');
var app = express();
const routes = require('./routes');
app.use('/api',routes);
app.listen(5000,()=>{
    console.log("Listening");
});