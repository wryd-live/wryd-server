const express = require("express");
const Router=express.Router();
const mysqlConnection=require("../utils/connection");
var validator=require('validator');
const crypto=require("crypto");

const {sendEmailVerificationLink,sendForgotLink} = require('../utils/emailController');


function CreateVerificationKey()
{
    const verificationKey=crypto.randomBytes(64).toString('hex');
    return verificationKey;
}

function CreateForgetKey()
{
    const forgetKey=crypto.randomBytes(64).toString('hex');
    return forgetKey;
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

function checkIfUserExists(userid){
    return myPromise = new Promise(myResolve=>{
        mysqlConnection.query("Select Userid from forgot where userid = ?",[userid],(err,rows,fields)=>{
            if(!err){
                if(rows.length) myResolve(true);
                else myResolve(false);
            }
            else{myResolve(false)}
        })
    })
}

function updatePassword(userid,password){
    console.log(userid,password)
    return myPromise = new Promise((myResolve,myReject)=>{
        mysqlConnection.query("update user set password = ? where id = ?",[password,userid],(err,result)=>{
            if(!err){
                if(result.affectedRows){
                    myResolve({status:200,message:"password changed successfullt"})
                }
                else{
                    myResolve({status:404,message:err.sqlMessage,user:{}})
                }
            }
            else{
                console.log(err)
                myReject({status:500,msg:"something went wrong",user:{}})
            }
        })
    })
}

function getUserDetails(email){
    return new Promise((myResolve,myReject)=>{
        let user;
        mysqlConnection.query("select * from user where email = ?",[email],(err,rows,fields)=>{
            if(!err){
                if(rows.length){
                    user = rows[0];
                    myResolve({status:200,message:"user exists in database",user:user})
                }
                else{
                    myResolve({status:404,message:"user doesn't exist in database",user:{}})
                }
            }
            else{
                myReject({status:500,msg:"something went wrong",user:{}})
            }
        })
    })
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

Router.get("/forget/:email",async(req,res) => {
    //email is sent here which user click and request is sent to another route
    try{
        const email = req.params.email;
        const verify = await getUserDetails(email);
        if(verify.status!=200){
            res.json({status:verify.status,message:verify.message,user:verify.user})
            return
        }
        const {user} = verify;
        const forgetKey = CreateForgetKey();
        const date = new Date();
        const time = date.getTime();
        let query;

        if(await checkIfUserExists(user.id)){
            query = `update forgot set forgetkey = ?,time = ? where userid = ?`
        }
        else{
            query = `INSERT INTO forgot (forgetkey,time,userid) VALUES (?,?,?)`
        }

        mysqlConnection.query(query,[forgetKey,time,user.id],(err,result)=>{
            if(err)
            {
                const myerr = err.errno;
                console.log(myerr)
                res.status(400);
                if(myerr==1062)
                {
                    res.json(
                        {
                            code: 400,
                            msg: "Dupliacte entry"
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
                const mail = sendForgotLink(user.name,user.id,user.email,forgetKey,req)
                res.json({
                    code:200,
                    msg: "Mail sent successfully"
                })
            }
        });
    }
    catch(err){
        res.json({status:err.status,message:err.message})
    }
    
})

Router.get("/forgetify/:userid/:forgetKey",async(req,res)=>{
    try{
        const userid = req.params.userid;
        const forgetKey = req.params.forgetKey;
        const query = "SELECT userid,forgetkey FROM forgot where userid = ?"
        mysqlConnection.query(query,[userid],(err,rows,fields)=>{
            if(err)
            {
                const myerr = err.errno;
                console.log(err)
                res.status(400);
                
                    res.json(
                        {
                            code: 2003,
                            msg: "Other Error"
                        }
                    );
            }
            else
            {
                console.log(rows)
                const mainUserid = rows.length&&rows[0].userid;
                const mainForgetKey = rows.length&&rows[0].forgetkey;
                console.log(userid,forgetKey,"\n")
                console.log(mainUserid,mainForgetKey,"\n")
                if(mainUserid==userid&&mainForgetKey==forgetKey){
                    // res.json({
                    //     code:200,
                    //     msg: "Mail sent successfully"
                    // })
                    res.render('reset.ejs',{userid,forgetKey})    
                }
                else{
                    res.json({
                        code:404,
                        msg:"userid or forgot key is invalid"
                    })
                }
            }
        });
         
    }
    catch(err){
        console.log(err)
    }
})

Router.post("/forgetify/:userid/:forgetKey",async(req,res)=>{
    try{
        const userid = req.params.userid;
        console.log(await req.body)
        const forgetKey = req.params.forgetKey;
        const password = req.body.password;
        console.log(password)
        const confirmPassword = req.body.confirmPassword;
        if(password!=confirmPassword){res.render('/reset',{msg:"password doesn't match",userid:userid,forgetKey:forgetKey})}
        else{
            const result = await updatePassword(userid,password);
            res.json({code:result.code,msg:result.msg});
        }
    }
    catch(err){
        console.log(err)
        res.json({err})
    }
})


module.exports=Router;