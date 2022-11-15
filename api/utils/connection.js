require('dotenv').config();
const mysql = require("mysql")
var mysqlConnection = mysql.createPool({
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASSWORD,
    database: process.env.DBNAME,
    multipleStatements : true
});


// mysqlConnection.connect((err)=>{
//     if(!err)
//     {
//         console.log("Database Connected!");
//     }
//     else
//     {
//         console.log("Database Connection Failed!");
//     }
// })

module.exports=mysqlConnection;