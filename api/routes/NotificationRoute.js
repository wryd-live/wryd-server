const express = require("express");
const Router = express.Router();
const mysqlConnection = require("../utils/connection");
const {requireAuth} = require("../middleware/authMiddleware");


Router.get("/", requireAuth, (req,res)=>{

    const userid = req.params.userid;
    const query_string = `SELECT notification.notificationid,notification.type,notification.personid,notification.time,user.name as person_name,user.imageurl
    FROM notification
    INNER JOIN user
    ON notification.personid = user.id
    where userid = ?
    ORDER BY time DESC`

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

Router.get("/dismiss/:notificationid",requireAuth, (req,res)=>{

    const notifyid = req.params.notificationid;
    const userid = req.params.userid;
    
    mysqlConnection.query("Delete FROM notification WHERE notification.userid = ? AND notification.notificationid = ?",[userid,notifyid],(err,rows,fields)=>{
        if(!err)
        {
            if(rows["affectedRows"]!=0)
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