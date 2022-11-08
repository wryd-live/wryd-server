const express = require("express");
const Router=express.Router();
const mysqlConnection=require("../utils/connection");

Router.get("/",(req,res)=>{
    mysqlConnection.query("SELECT id, name, email, organization,verified,verificaction_key FROM user",(err,rows,fields)=>{
        if(!err)
        {
            res.send(rows);
        }
        else
        {
            console.log(err);
        }
    })
})

module.exports=Router;