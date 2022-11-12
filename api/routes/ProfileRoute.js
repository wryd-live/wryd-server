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
function removeOutgoingRequest(first, second)
{
    const query_str = `DELETE FROM request_outgoing
        WHERE first = ? and second = ?`
    return new Promise(resolve=>{
        mysqlConnection.query(query_str,[first,second],(err,rows,fields)=>{
            if(rows["affectedRows"]!=0)
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
function removeIncomingRequest(first, second)
{
    const query_string = `DELETE FROM request_incoming
                    WHERE first = ? and second = ?`
    return new Promise(resolve=>{
        mysqlConnection.query(query_string,[first,second],(err,rows,fields)=>{
            if(rows["affectedRows"]!=0)
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

Router.get("/request/send/:personid/:userid",async (req,res)=>{

    const userid=req.params.userid;
    const personid=req.params.personid;
    const isFriend = await isPersonMyFriend(userid,personid);
    const incoming = await incomingRequest(userid,personid);
    const outgoing = await outgoingRequest(userid,personid);

    if(isFriend)
    {
        res.json(
            {
                msg: "Already Friend"
            }    
        );
    }
    else if(incoming || outgoing)
    {
        res.json(
            {
                msg: "Request Ongoing"
            }    
        );
    }
    else if(!isFriend && !(incoming && outgoing))
    {
        mysqlConnection.query("INSERT INTO request_outgoing(first,second) values (?,?)",[userid,personid],(err,rows,fields)=>{
            if(err)
            {
                res.sendStatus(404);
            }
        })
        mysqlConnection.query("INSERT INTO request_incoming(first,second) values (?,?)",[personid,userid],(err,rows,fields)=>{
            if(err)
            {
                res.sendStatus(404);
            }
        })
        const req_type = `requested`;
        mysqlConnection.query("INSERT INTO notification(userid,type,personid) values (?,?,?)",[personid,req_type,userid],(err,rows,fields)=>{
            if(!err)
            {
                res.sendStatus(200);
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

Router.get("/request/cancel/:personid/:userid",async (req,res)=>{

    const userid=req.params.userid;
    const personid=req.params.personid;
    const outgoing = await outgoingRequest(userid,personid);

    if(outgoing)
    {
        const removeIncoming = await removeIncomingRequest(personid,userid);
        const removeOutgoing = await removeOutgoingRequest(userid,personid);
        
        if(removeIncoming && removeOutgoing)
        {
            res.sendStatus(200);
        }
        else{
            res.sendStatus(404);
        }
    }
    else
    {
        res.sendStatus(404);
    }
})

Router.get("/request/accept/:personid/:userid",async (req,res)=>{

    const userid=req.params.userid;
    const personid=req.params.personid;
    const incoming = await incomingRequest(personid,userid);

    if(incoming)
    {
        mysqlConnection.query("INSERT INTO friends(first,second) values (?,?)",[userid,personid],(err,rows,fields)=>{
            if(err)
            {
                res.sendStatus(404);
            }
        })
        mysqlConnection.query("INSERT INTO friends(first,second) values (?,?)",[personid,userid],(err,rows,fields)=>{
            if(err)
            {
                res.sendStatus(404);
            }
        })
        const req_type = `accepted`;
        mysqlConnection.query("INSERT INTO notification(userid,type,personid) values (?,?,?)",[personid,req_type,userid],(err,rows,fields)=>{
            if(err)
            {
                res.sendStatus(404);
            }
        })
        const removeIncoming = await removeIncomingRequest(personid,userid);
        const removeOutgoing = await removeOutgoingRequest(userid,personid);
        
        if(removeIncoming && removeOutgoing)
        {
            res.sendStatus(200);
        }
        else{
            res.sendStatus(404);
        }

    }
    else
    {
        res.sendStatus(404);
    }

})


Router.get("/unfriend/:personid/:userid",async (req,res)=>{

    const userid=req.params.userid;
    const personid=req.params.personid;
    const isFriend = await isPersonMyFriend(userid,personid);
    const query_str = `DELETE FROM friends
    WHERE first = ? AND second = ?`
    if(isFriend)
    {
        mysqlConnection.query(query_str,[userid,personid],(err,rows,fields)=>{
            if(!err)
            {
                if(rows["affectedRows"]!=0)
                {
                    const query_string = `DELETE FROM friends
                    WHERE first = ? AND second = ?`
                    mysqlConnection.query(query_string,[personid,userid],(err,rows,fields)=>{
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
                console.log(err);
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