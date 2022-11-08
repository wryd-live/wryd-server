const express = require("express")
const bodyParser = require("body-parser");
const mysqlConnection=require("./utils/connection");
require('dotenv').config();

//Routes Variables
const user_routes =require("./routes/UserRoutes");


const app = express()

app.use(bodyParser.json());
app.set('json spaces', 2);

//Routing
app.use("/api/user",user_routes);

const port = process.env.PORT || 80;





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
    res.send("Error 404 - Page Not Found");
});


app.listen(port,()=>{
    console.log("Listening at port "+port);
});