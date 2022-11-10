const express = require("express")
const bodyParser = require("body-parser");
const morgan = require("morgan");

const mysqlConnection=require("./utils/connection");
require('dotenv').config();

const user_routes =require("./routes/UserRoutes");
const organization_routes =require("./routes/OrganizationRoutes");



const app = express()

app.use(bodyParser.json());
app.set('json spaces', 2);

app.use(morgan('dev'))


app.use("/api/user",user_routes);
app.use("/api/organization/",organization_routes);

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