const express = require("express");
const Router=express.Router();
const mysqlConnection=require("../utils/connection");
var validator=require('validator');
const crypto=require("crypto");

function CreateVerificationKey()
{
    const verificationKey=crypto.randomBytes(64).toString('hex');
    return verificationKey;
}

function CheckEmailDomain(email,organization_id)
{
    return myPromise = new Promise(myResolve => {
    let orgDomain;
    mysqlConnection.query("SELECT domain FROM organization WHERE id=?",[organization_id],(err,rows,fields)=>{
        if(!err)
        {
            orgDomain=rows[0]["domain"];
            const userDomain=email.split('@')[1];
            if (orgDomain===userDomain) {
                myResolve(true);
            } else {
                myResolve(false);
            }
        }
        else
        {
            console.log(err);
            myResolve(false);
        }
    })
    });
}

Router.post('/create', async(req, res) => {
    var postData=req.body;
    const {name,email,password,organization_id}=postData;
    
    
    if(name=="" || email=="" || password=="" || name == null || email==null || password==null)
    {
        res.status(404);
        res.json({
            code:2001,
            msg:"Invalid Format Name | Password | Email"
        })
        return;
    }

    const isDomainValid= await CheckEmailDomain(email,organization_id);
    let verificationKey;
    if(!isDomainValid)
    {
        res.status(404);
        res.json({
            code:2004,
            msg:"Invalid Orgainization_Domain"
        })
        return;
    }
    else
    {
        verificationKey=CreateVerificationKey();
        const imageurl= `https://api.multiavatar.com/${name}`;
        mysqlConnection.query("INSERT INTO user (name,email,password,organization,verification_key,imageurl) VALUES (?,?,?,?,?,?)",[name,email,password,organization_id,verificationKey,imageurl],(err,rows,fields)=>{
            if(err)
            {
                const myerr = err.errno;
                res.status(404);

                if(myerr==1062)
                {
                    res.json(
                        {
                            code: 2002,
                            msg: "Email Already Exists"
                        }
                    );
                }
                else
                {
                    res.json(
                        {
                            code: 2003,
                            msg: "Other Error"
                        }
                    );
                }
            }
            else
            {
                //user inserted
                const userid=rows.insertId;
                var ans = sendEmailVerificationLink(userid,name,email,verificationKey,req);
                var ans = true;
                
                res.json({
                    code:200,
                    msg: "User Created Successfully"
                })
            }
        });
    }
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

Router.post("/dp/:id",(req,res)=>{
    const userid=req.params.id;
    const postData=req.body;
    const {imageurl}=postData;
    if(imageurl==null)
    {
        res.send("Invalid input");
        return;
    }
    mysqlConnection.query("UPDATE user SET imageurl=? WHERE id=?",[imageurl,userid],(err,rows,fields)=>{
        if(err)
        {
            console.log(err);
        }
        else
        {
            if(rows.affectedRows==0)
            {
                res.send("Invalid User");
                return;
            }
            res.send("Image Updated Successfully");
        }
    })
})

Router.delete("/dp/:id",(req,res)=>{
    const userid=req.params.id;
    mysqlConnection.query("SELECT name FROM user WHERE id=?",[userid],(err,rows1,fields)=>{
        if(err)
        {
            console.log(err);
        }
        else
        {
            // console.log(rows);
            if(rows1.length==0)
            {
                res.send("User doesnt exist");
                return;
            }
            else
            {
                const name=rows1[0]["name"];
                const imageurl=`https://api.multiavatar.com/${name}`;
                mysqlConnection.query("UPDATE user SET imageurl=? WHERE id=?",[imageurl,userid],(err,rows,fields)=>{
                    if(err){
                        console.log(err);
                    }
                    else
                    {
                        res.send("Profile Pic Deleted Successfully");
                    }
                })
            }
        }
    })

})

Router.get("/verify/:userid/:verification_key",(req,res)=>{
    const userid=req.params.userid;
    const verificationKey=req.params.verification_key;
    mysqlConnection.query("UPDATE user SET verified = 1 WHERE verification_key = ? AND id = ?",[verificationKey,userid],(err,rows,fields)=>{
        if(err)
        {
            console.log(err);
        }
        else
        {
            if(rows.affectedRows==0)
            {
                res.send("Link Expired(already verified)/Invalid Key/Invalid User");
                return;
            }
            mysqlConnection.query("UPDATE user SET verification_key=? WHERE id=?",[null,userid],(err,rows,fields)=>{
                if(err)
                {
                    console.log(err);
                }
                else
                {
                    console.log("Verification key set to NULL");
                    res.send("User Verified");
                }
            })
        }
    })
})
module.exports=Router;