const e = require("express");
const express = require("express");
const Router = express.Router();
const mysqlConnection = require("../utils/connection");


Router.get("/friends/:userid",async (req,res)=>{

    const userid=req.params.userid;
    const query_string = `SELECT friends.second as person_id,user.name as person_name,user.imageurl,user.email as person_email,friends.time
    FROM friends
    INNER JOIN user
    ON friends.second = user.id
    where friends.first = ?`
    
    mysqlConnection.query(query_string,[userid],(err,rows,fields)=>{
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
            console.log(err);
            res.sendStatus(404);
        }
    })
})

function isPersonMyFriend(first, second)
{
    return new Promise(resolve=>{
        mysqlConnection.query("SELECT friends.id From friends WHERE friends.first=? AND friends.second=?",[first,second],(err,rows,fields)=>{

            if(!err && rows.length!=0)
            {
                resolve(true);
            }
            else
            {
                resolve(false);
            }
        })
    });
}
function incomingRequest(first, second)
{
    return new Promise(resolve=>{
        mysqlConnection.query("SELECT request_incoming.id From request_incoming WHERE request_incoming.first=? AND request_incoming.second=?",[first,second],(err,rows,fields)=>{
            if(!err && rows.length!=0)
            {
                resolve(true);
            }
            else
            {
                resolve(false);
            }
        })
    });
}
function outgoingRequest(first, second)
{
    return new Promise(resolve=>{
        mysqlConnection.query("SELECT request_outgoing.id From request_outgoing WHERE request_outgoing.first=? AND request_outgoing.second=?",[first,second],(err,rows,fields)=>{
            if(!err && rows.length!=0)
            {
                resolve(true);
            }
            else
            {
                resolve(false);
            }
        })

    });
}

Router.get("/view/:personid/:userid", async(req, res) => {

    const userid = req.params.userid;
    const personid = req.params.personid;
    const query_string = `SELECT user.id as person_id,user.name as person_name,user.imageurl,user.email as person_email
    FROM user
    WHERE user.id = ?`

    mysqlConnection.query(query_string,[personid],async (err, rows, fields) => {
        if (!err) {
            const isFriend = await isPersonMyFriend(userid,personid);
            if(rows.length != 0 && isFriend)
            {
                obj = {
                    "friend": true,
                    "request": false,
                    "request-type": null,
                }
                let result = Object.values(JSON.parse(JSON.stringify(rows)));
                // console.log(Object.assign(...result,obj));
                let z = Object.assign(...result,obj);
                res.send(z);
            }
            else if(rows.length != 0 && !isFriend)
            {
                const incoming = await incomingRequest(userid,personid);
                const outgoing = await outgoingRequest(userid,personid);
                if(incoming)
                {
                    obj = {
                        "friend": false,
                        "request": true,
                        "request-type": `incoming`
                    }
                    let result = Object.values(JSON.parse(JSON.stringify(rows)));
                    let z = Object.assign(...result,obj);
                    res.send(z);
                }
                else if(outgoing)
                {
                    obj = {
                        "friend": false,
                        "request": true,
                        "request-type": `outgoing`
                    }    
                    let result = Object.values(JSON.parse(JSON.stringify(rows)));
                    let z = Object.assign(...result,obj);
                    res.send(z);
                }
                else
                {
                    obj = {
                        "friend": false,
                        "request": false,
                        "request-type": null
                    }    
                    let result = Object.values(JSON.parse(JSON.stringify(rows)));
                    let z = Object.assign(...result,obj);
                    res.send(z);
                }
            }
            else{
                res.sendStatus(404);
            }
        }
        else {
            res.sendStatus(404);
        }
    })
})

Router.get("/request/cancel/:personid/:userid",async (req,res)=>{

    const userid=req.params.userid;
    const personid=req.params.personid;
    const outgoing = await outgoingRequest(userid,personid);

    if(outgoing)
    {
        const query_str = `DELETE FROM request_outgoing
        WHERE first = ? and second = ?`
        
        mysqlConnection.query(query_str,[userid,personid],async (err,rows,fields)=>{
            if(!err)
            {
                if(rows["affectedRows"]!=0)
                {
                    const query_string = `DELETE FROM request_incoming
                    WHERE first = ? and second = ?`

                    mysqlConnection.query(query_string,[personid,userid],async (err,rows,fields)=>{
                        if(!err)
                        {
                            if(rows["affectedRows"]!=0)
                            {
                                res.sendStatus(200);
                            }
                            else
                            {
                                res.sendStatus(404);
                            }
                        }
                        else
                        {
                            res.sendStatus(404);
                        }
                    })
                }
                else
                {
                    res.sendStatus(404);
                }
            }
            else
            {
                res.sendStatus(404);
            }
        })
    }
    else
    {
        res.sendStatus(404);
    }
})


module.exports = Router;