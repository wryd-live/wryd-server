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

module.exports = Router;