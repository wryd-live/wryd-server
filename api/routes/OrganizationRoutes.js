const express=require("express");
const Router=express.Router();
const mysqlConnection=require("../utils/connection");

Router.post('/create', function (req, res) {
    var postData = req.body;
    const {username,name,domain} = postData;
    console.log(username);
    console.log(name);
    console.log(domain);
    /*
    // validate request
    if(!req.body){
        res.status(404);
        res.json(
            {
                code: 1700,
                msg: "Empty Field"
            }
        );
        return;
    }
    */
    mysqlConnection.query("INSERT INTO organization (username, name, domain) VALUES (?, ?, ?)", [username,name,domain],(err, rows, fields)=>{
        if(!err)
        {
            res.json(
                {
                    code: 1200,
                    msg: "Organization Created"
                }    
            );
        }
        else
        {
            console.log(err);
            const myerr = err.errno;
            res.status(404);

            if(myerr==1062)
            {
                res.json(
                    {
                        code: 1500,
                        msg: "Organization Already Exists"
                    }
                );
            }
            else if(myerr==1048)
            {
                res.json(
                    {
                        code: 1700,
                        msg: "Empty Field"
                    }
                );
                return;  
            }
            else
            {
                res.json(
                    {
                        code: 1600,
                        msg: "Internal Error"
                    }
                );
            }
            
        }
    })
})

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
    
    mysqlConnection.query("SELECT * FROM organization WHERE organization.id=?",[orgid],(err,rows,fields)=>{
        if(!err)
        {
            if(rows.length != 0)
            {
                res.send(rows);
            }
            else
            {
                res.sendStatus(404);
            }
            
        }
        else
        {
            res.status(404);
            res.sendStatus(404);
            console.log(err);
        }
    })
})

Router.get("/delete/:id",(req,res)=>{

    const orgid=req.params.id;
    
    mysqlConnection.query("DELETE FROM organization WHERE organization.id=?",[orgid],(err,rows,fields)=>{
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