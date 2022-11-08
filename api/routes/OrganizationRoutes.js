const express=require("express");
const Router=express.Router();
const mysqlConnection=require("../utils/connection");

Router.get("/all",(req,res)=>{
    mysqlConnection.query("SELECT * FROM organization",(err,rows,fields)=>{
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

Router.get("/view/:id",(req,res)=>{

    const orgid=req.params.id;
    
    mysqlConnection.query("SELECT organization.username,organization.name,organization.domain FROM organization WHERE organization.id=?",[orgid],(err,rows,fields)=>{
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