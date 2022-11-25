const express = require("express")
const bodyParser = require("body-parser");
const morgan = require("morgan");
const ejs = require('ejs')
const path = require('path');

const mysqlConnection=require("./utils/connection");
require('dotenv').config();

const user_routes =require("./routes/UserRoutes");
const organization_routes =require("./routes/OrganizationRoutes");
const search_route = require("./routes/SearchRoute");
const notification_route = require("./routes/NotificationRoute");
const profile_route = require("./routes/ProfileRoute");
const location_route = require("./routes/LocationRoute")
const login_route = require("./routes/LoginRoute")



const app = express()

app.use(bodyParser.json());
app.set('json spaces', 2);

app.use(morgan('dev'))
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'/../views'));


app.use("/api/user",user_routes);
app.use("/api/organization/",organization_routes);
app.use("/api/search/",search_route);
app.use("/api/notification/",notification_route);
app.use("/api/profile/",profile_route);
app.use("/api/location/",location_route);
app.use("/api/login/",login_route);

const port = process.env.PORT || 80;





app.get('/',(req,res)=>{
    res.send("Welcome to WRYD API Server");
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

app.get('/template/verification',(req,res)=>{
    res.render('userVerified',{
        name: "Yuvraj"
    });
});


app.get('/privacy-policy',(req,res)=>{

    res.sendFile("privacy-policy.html",{root: path.join(__dirname, '/public/pages')});
});


app.get("*",(req,res)=>{
    res.status(404);
    res.send("Error 404 - Page Not Found");
});


app.listen(port,()=>{
    console.log("Listening at port "+port);
});