const express = require("express");
const Router=express.Router();
const mysqlConnection=require("../utils/connection");
var validator=require('validator');
const crypto=require("crypto");

function SendEmail(name,email,verificationKey){
    return true;
}

function CreateVerificationKey()
{
    const verificationKey=crypto.randomBytes(64).toString('hex');
    return verificationKey;
}

function CheckEmailDomain(email,orgainization_id)
{
    mysqlConnection.query("SELECT domain FROM organization WHERE id=?",[orgainization_id],(err,rows,fields)=>{
        const orgDomain=rows;
    })
    const userDomain=email.split("@")[1];
}


Router.post('/create', function (req, res) {
    var postData = req.body;
    const {name,email,password,orgainization_id} = postData;

    if(name=="" || email=="" || password=="" || name == null || email==null || password==null)
    {
        // res.statusCode(2001).send("Invalid Format Name | Password | Email ");
        res.send("Invalid");
        return;
    }
    
    
    
    if(validator.isAlpha(name,undefined,{ignore: " "}) && validator.isEmail(email)  && validator.isStrongPassword(password))
    {

        const verificationKey=CreateVerificationKey();
        var sentEmail=SendEmail(name,email,verificationKey);
        if(sentEmail)
        {
            console.log("Email Sent Successfuly");
        }
        else
        {
            console.log("Some Error occured while sending email");
        }
    }
    else{
        res.statusCode(2001).send("Invalid Format Name | Password | Email ");
    }



    // console.log(username);
    // console.log(name);
    // console.log(domain);
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
    mysqlConnection.query("SELECT id, name, email, organization,verified,imageurl FROM user",(err,rows,fields)=>{
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

Router.get("/all/:orgid",(req,res)=>{

    const orgid=req.params.orgid;

    mysqlConnection.query("SELECT user.id, user.name,user.organization,user.verified,user.imageurl FROM user WHERE user.organization=?",[orgid],(err,rows,fields)=>{
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

Router.get("/all/view/:id",(req,res)=>{

    const userid=req.params.id;

    mysqlConnection.query("SELECT user.id, user.name,user.organization,user.verified,user.imageurl FROM user WHERE user.id=?",[userid],(err,rows,fields)=>{
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

Router.get("/all/delete/:id",(req,res)=>{

    const userid=req.params.id;
    mysqlConnection.query("DELETE FROM user WHERE user.id=?",[userid],(err,rows,fields)=>{
        if(!err)
        {
            if(rows["affectedRows"]==0)
            {
                res.send("User not found by given id");
            }
            else
            {
                res.send("User Deleted Successfully");
            }
        }
        else
        {
            console.log(err);
        }
    }) 
})

module.exports=Router;