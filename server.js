const express = require("express")
const mysql = require("mysql")
const bodyParser = require("body-parser");
require('dotenv').config();



const app = express()

app.use(bodyParser.json());
app.set('json spaces', 2);


const port = process.env.PORT || 80;


var mysqlConnection = mysql.createConnection({
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASSWORD,
    database: process.env.DBNAME,
    multipleStatements : true
});


mysqlConnection.connect((err)=>{
    if(!err)
    {
        console.log("Database Connected!");
    }
    else
    {
        console.log("Database Connection Failed!");
    }
})


app.get('/',(req,res)=>{
    res.send("Welcome to WRYD Server");
});


//Example Query Request
/*
app.get('/api/city',(req,res)=>{
    mysqlConnection.query("SELECT * FROM city",(err,rows,fields)=>{
        if(!err)
        {
            res.send(rows);
        }
        else
        {
            console.log(err);
        }
    });
});
*/


app.get("*",(req,res)=>{
    res.send("Error 404");
});


app.listen(port,()=>{
    console.log("Listening at port "+port);
});