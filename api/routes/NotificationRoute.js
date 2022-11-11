const express = require("express");
const Router = express.Router();
const mysqlConnection = require("../utils/connection");

Router.get("/:userid",(req,res)=>{

    const userid = req.params.userid;

    mysqlConnection.query("SELECT * FROM notification WHERE notification.userid=? ORDER BY time DESC",[userid],(err,rows,fields)=>{
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

Router.get("/dismiss/:notificationid/:userid",(req,res)=>{

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